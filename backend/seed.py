"""
Seed script — Spanish (from English) course
Run: python seed.py  (from backend/)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, datetime, timedelta
from app.db.database import SessionLocal, init_db
from app.models.user import User
from app.models.course import Course, Unit, Skill, Lesson, Exercise
from app.models.progress import UserCourseProgress, UserSkillProgress, UserLessonProgress
from app.models.gamification import Achievement, UserAchievement, LeaderboardEntry


# ─── Exercise helpers ────────────────────────────────────────────────────────

def mc(lesson, idx, prompt, correct, options, hint=None):
    return Exercise(lesson=lesson, order_index=idx, type="multiple_choice",
                    prompt=prompt, correct_answer=correct, options=options, hint=hint)

def wb(lesson, idx, prompt, correct, word_bank, hint=None):
    return Exercise(lesson=lesson, order_index=idx, type="translate_word_bank",
                    prompt=prompt, correct_answer=correct, word_bank=word_bank, hint=hint)

def fb(lesson, idx, sentence, correct, options, hint=None):
    return Exercise(lesson=lesson, order_index=idx, type="fill_blank",
                    prompt=f"Fill in the blank", correct_answer=correct,
                    sentence_with_blank=sentence, options=options, hint=hint)

def ta(lesson, idx, prompt, correct, hint=None):
    return Exercise(lesson=lesson, order_index=idx, type="type_answer",
                    prompt=prompt, correct_answer=correct, hint=hint)

def mp(lesson, idx, prompt, pairs):
    # correct_answer encodes all pairs as "left1=right1,left2=right2"
    correct = ",".join(f"{p['left']}={p['right']}" for p in pairs)
    return Exercise(lesson=lesson, order_index=idx, type="match_pairs",
                    prompt=prompt, correct_answer=correct, match_pairs=pairs)


# ─── Seed ────────────────────────────────────────────────────────────────────

def seed():
    init_db()
    db = SessionLocal()

    # Wipe existing data
    for model in [UserAchievement, Achievement, LeaderboardEntry,
                  UserLessonProgress, UserSkillProgress, UserCourseProgress,
                  Exercise, Lesson, Skill, Unit, Course, User]:
        db.query(model).delete()
    db.commit()

    # ── Users ─────────────────────────────────────────────────────────────────
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    learner = User(
        id=1, username="learner", display_name="You",
        avatar_url="", total_xp=120, current_streak=3, longest_streak=5,
        last_activity_date=today, hearts=5, max_hearts=5,
        hearts_updated_at=datetime.utcnow(), gems=500,
        daily_xp_goal=20, daily_xp_earned=10, daily_xp_date=today,
    )
    bots = [
        User(id=2, username="lucia", display_name="Lucía García", total_xp=980, current_streak=14, longest_streak=30, hearts=5, max_hearts=5, hearts_updated_at=datetime.utcnow(), gems=200, daily_xp_goal=30, daily_xp_earned=30, daily_xp_date=today),
        User(id=3, username="marco", display_name="Marco Rossi",  total_xp=750, current_streak=7, longest_streak=21, hearts=4, max_hearts=5, hearts_updated_at=datetime.utcnow(), gems=150, daily_xp_goal=20, daily_xp_earned=20, daily_xp_date=today),
        User(id=4, username="aisha", display_name="Aisha Patel",  total_xp=540, current_streak=5, longest_streak=10, hearts=5, max_hearts=5, hearts_updated_at=datetime.utcnow(), gems=300, daily_xp_goal=10, daily_xp_earned=10, daily_xp_date=today),
        User(id=5, username="chen",  display_name="Chen Wei",     total_xp=310, current_streak=2, longest_streak=8, hearts=3, max_hearts=5, hearts_updated_at=datetime.utcnow(), gems=100, daily_xp_goal=20, daily_xp_earned=0, daily_xp_date=today),
        User(id=6, username="priya", display_name="Priya Sharma", total_xp=210, current_streak=1, longest_streak=4, hearts=5, max_hearts=5, hearts_updated_at=datetime.utcnow(), gems=50, daily_xp_goal=10, daily_xp_earned=10, daily_xp_date=today),
    ]
    db.add(learner)
    db.add_all(bots)
    db.flush()

    # ── Course ────────────────────────────────────────────────────────────────
    course = Course(language_name="Spanish", language_code="es",
                    from_language="English", flag_emoji="🇪🇸",
                    description="Learn Spanish from English")
    db.add(course)
    db.flush()

    # ── Achievements ──────────────────────────────────────────────────────────
    ach_data = [
        ("First Step",    "Complete your first lesson",      "🎯", "lessons_completed", 1),
        ("On a Roll",     "Complete 5 lessons",              "🔥", "lessons_completed", 5),
        ("Dedicated",     "Complete 25 lessons",             "📚", "lessons_completed", 25),
        ("Century Club",  "Earn 100 XP",                     "💯", "xp_total", 100),
        ("XP Master",     "Earn 500 XP",                     "⭐", "xp_total", 500),
        ("Streak Starter","Reach a 3-day streak",            "🌟", "streak", 3),
        ("Week Warrior",  "Reach a 7-day streak",            "🏆", "streak", 7),
        ("Unstoppable",   "Reach a 30-day streak",           "🚀", "streak", 30),
    ]
    achievements = []
    for name, desc, icon, ctype, cval in ach_data:
        a = Achievement(name=name, description=desc, icon_name=icon,
                        criteria_type=ctype, criteria_value=cval)
        db.add(a)
        achievements.append(a)
    db.flush()

    # Award "First Step" + "Century Club" + "Streak Starter" to learner
    for a in achievements:
        if a.criteria_type == "lessons_completed" and a.criteria_value == 1:
            db.add(UserAchievement(user_id=1, achievement_id=a.id))
        if a.criteria_type == "xp_total" and a.criteria_value == 100:
            db.add(UserAchievement(user_id=1, achievement_id=a.id))
        if a.criteria_type == "streak" and a.criteria_value == 3:
            db.add(UserAchievement(user_id=1, achievement_id=a.id))

    # ── Leaderboard ───────────────────────────────────────────────────────────
    lb_data = [(1, 120), (2, 350), (3, 280), (4, 190), (5, 80), (6, 60)]
    for uid, xp in lb_data:
        db.add(LeaderboardEntry(user_id=uid, weekly_xp=xp, league="Gold", week_start=week_start))

    # ═══════════════════════════════════════════════════════════════════════════
    # UNIT 1 — BASICS
    # ═══════════════════════════════════════════════════════════════════════════
    u1 = Unit(course=course, order_index=0, title="Basics",
              description="Start your Spanish journey", color="#58CC02")
    db.add(u1)
    db.flush()

    # ── Skill 1.1: Greetings ──────────────────────────────────────────────────
    sk_greet = Skill(unit=u1, order_index=0, title="Greetings", icon_name="👋", total_lessons=3)
    db.add(sk_greet); db.flush()

    les = Lesson(skill=sk_greet, order_index=0, xp_reward=10); db.add(les); db.flush()
    db.add_all([
        mc(les,0,"How do you say 'Hello' in Spanish?","Hola",["Hola","Adiós","Gracias","Por favor"]),
        wb(les,1,"Translate: 'Good morning'","Buenos días",["Buenos","días","Malos","Noches"]),
        fb(les,2,"_____ noches (Good evening)","Buenas",["Buenos","Buenas","Mal"]),
        ta(les,3,"Write 'Thank you' in Spanish","Gracias","Think: Gra-cias"),
        mp(les,4,"Match the greetings",[{"left":"Hello","right":"Hola"},{"left":"Goodbye","right":"Adiós"},{"left":"Please","right":"Por favor"},{"left":"Thanks","right":"Gracias"}]),
    ])

    les2 = Lesson(skill=sk_greet, order_index=1, xp_reward=10); db.add(les2); db.flush()
    db.add_all([
        mc(les2,0,"What does 'Buenas noches' mean?","Good night",["Good morning","Good night","Good afternoon","Hello"]),
        wb(les2,1,"Translate: 'How are you?'","¿Cómo estás?",["¿Cómo","estás?","eres?","Qué"]),
        ta(les2,2,"Write 'Good afternoon' in Spanish","Buenas tardes","Tar-des = afternoon"),
        fb(les2,3,"Mucho _____ (Nice to meet you)","gusto",["gusto","malo","bien"]),
        mp(les2,4,"Match the phrases",[{"left":"Good morning","right":"Buenos días"},{"left":"Good night","right":"Buenas noches"},{"left":"How are you?","right":"¿Cómo estás?"},{"left":"Nice to meet you","right":"Mucho gusto"}]),
    ])

    les3 = Lesson(skill=sk_greet, order_index=2, xp_reward=10); db.add(les3); db.flush()
    db.add_all([
        mc(les3,0,"How do you say 'See you later'?","Hasta luego",["Hasta luego","Hola","De nada","Por favor"]),
        wb(les3,1,"Translate: 'You're welcome'","De nada",["De","nada","Por","favor"]),
        ta(les3,2,"Write 'Excuse me' in Spanish","Perdón","Like 'pardon'"),
        fb(les3,3,"_____ favor (Please)","Por",["Por","Con","Sin"]),
        mp(les3,4,"Match",[{"left":"See you later","right":"Hasta luego"},{"left":"You're welcome","right":"De nada"},{"left":"Excuse me","right":"Perdón"},{"left":"I'm sorry","right":"Lo siento"}]),
    ])

    # ── Skill 1.2: Family ─────────────────────────────────────────────────────
    sk_fam = Skill(unit=u1, order_index=1, title="Family", icon_name="👨‍👩‍👧", total_lessons=3)
    db.add(sk_fam); db.flush()

    les = Lesson(skill=sk_fam, order_index=0, xp_reward=10); db.add(les); db.flush()
    db.add_all([
        mc(les,0,"How do you say 'mother' in Spanish?","madre",["madre","padre","hermano","hermana"]),
        wb(les,1,"Translate: 'my father'","mi padre",["mi","padre","madre","tu"]),
        fb(les,2,"Mi _____ se llama Ana (My sister's name is Ana)","hermana",["hermana","hermano","madre"]),
        ta(les,3,"Write 'grandfather' in Spanish","abuelo","Abu-elo"),
        mp(les,4,"Match family members",[{"left":"mother","right":"madre"},{"left":"father","right":"padre"},{"left":"brother","right":"hermano"},{"left":"sister","right":"hermana"}]),
    ])

    les2 = Lesson(skill=sk_fam, order_index=1, xp_reward=10); db.add(les2); db.flush()
    db.add_all([
        mc(les2,0,"What is 'abuela'?","grandmother",["grandfather","grandmother","aunt","uncle"]),
        wb(les2,1,"Translate: 'my children'","mis hijos",["mis","hijos","padre","mi"]),
        ta(les2,2,"Write 'uncle' in Spanish","tío"),
        fb(les2,3,"Mi _____ tiene tres hijos (My aunt has three children)","tía",["tía","tío","prima"]),
        mp(les2,4,"Match",[{"left":"grandmother","right":"abuela"},{"left":"grandfather","right":"abuelo"},{"left":"aunt","right":"tía"},{"left":"cousin (f)","right":"prima"}]),
    ])

    les3 = Lesson(skill=sk_fam, order_index=2, xp_reward=10); db.add(les3); db.flush()
    db.add_all([
        mc(les3,0,"How do you say 'son'?","hijo",["hija","hijo","niño","niña"]),
        wb(les3,1,"Translate: 'My family is big'","Mi familia es grande",["Mi","familia","es","grande","pequeña"]),
        ta(les3,2,"Write 'wife' in Spanish","esposa"),
        fb(les3,3,"Tengo dos _____ (I have two daughters)","hijas",["hijas","hijos","hermanas"]),
        mp(les3,4,"Match",[{"left":"son","right":"hijo"},{"left":"daughter","right":"hija"},{"left":"husband","right":"esposo"},{"left":"wife","right":"esposa"}]),
    ])

    # ── Skill 1.3: Food ───────────────────────────────────────────────────────
    sk_food = Skill(unit=u1, order_index=2, title="Food", icon_name="🍎", total_lessons=3)
    db.add(sk_food); db.flush()

    les = Lesson(skill=sk_food, order_index=0, xp_reward=10); db.add(les); db.flush()
    db.add_all([
        mc(les,0,"How do you say 'apple'?","manzana",["manzana","naranja","pan","leche"]),
        wb(les,1,"Translate: 'I want water'","Quiero agua",["Quiero","agua","como","leche"]),
        fb(les,2,"Quiero _____ (I want bread)","pan",["pan","agua","leche"]),
        ta(les,3,"Write 'milk' in Spanish","leche"),
        mp(les,4,"Match food words",[{"left":"apple","right":"manzana"},{"left":"bread","right":"pan"},{"left":"milk","right":"leche"},{"left":"water","right":"agua"}]),
    ])

    les2 = Lesson(skill=sk_food, order_index=1, xp_reward=10); db.add(les2); db.flush()
    db.add_all([
        mc(les2,0,"What is 'pollo'?","chicken",["fish","chicken","beef","pork"]),
        wb(les2,1,"Translate: 'The food is delicious'","La comida es deliciosa",["La","comida","es","deliciosa","buena"]),
        ta(les2,2,"Write 'egg' in Spanish","huevo"),
        fb(les2,3,"Me gusta el _____ (I like rice)","arroz",["arroz","pollo","pan"]),
        mp(les2,4,"Match",[{"left":"chicken","right":"pollo"},{"left":"rice","right":"arroz"},{"left":"egg","right":"huevo"},{"left":"fish","right":"pescado"}]),
    ])

    les3 = Lesson(skill=sk_food, order_index=2, xp_reward=10); db.add(les3); db.flush()
    db.add_all([
        mc(les3,0,"How do you say 'orange'?","naranja",["manzana","naranja","uva","fresa"]),
        wb(les3,1,"Translate: 'I eat vegetables'","Como verduras",["Como","verduras","frutas","bebo"]),
        ta(les3,2,"Write 'coffee' in Spanish","café"),
        fb(les3,3,"Bebo _____ por la mañana (I drink coffee in the morning)","café",["café","agua","leche"]),
        mp(les3,4,"Match",[{"left":"orange","right":"naranja"},{"left":"grape","right":"uva"},{"left":"strawberry","right":"fresa"},{"left":"coffee","right":"café"}]),
    ])

    # ═══════════════════════════════════════════════════════════════════════════
    # UNIT 2 — TRAVEL
    # ═══════════════════════════════════════════════════════════════════════════
    u2 = Unit(course=course, order_index=1, title="Travel",
              description="Navigate the Spanish-speaking world", color="#1CB0F6")
    db.add(u2); db.flush()

    # ── Skill 2.1: Directions ─────────────────────────────────────────────────
    sk_dir = Skill(unit=u2, order_index=0, title="Directions", icon_name="🗺️", total_lessons=3)
    db.add(sk_dir); db.flush()

    for i, (prompt, answer, opts) in enumerate([
        ("Where is the hotel?","¿Dónde está el hotel?",["¿Dónde","está","el","hotel?","restaurante?"]),
        ("Turn left at the corner","Gira a la izquierda en la esquina",["Gira","a","la","izquierda","derecha","esquina"]),
        ("Go straight ahead","Sigue recto",["Sigue","recto","izquierda","derecha"]),
    ]):
        les = Lesson(skill=sk_dir, order_index=i, xp_reward=10); db.add(les); db.flush()
        db.add_all([
            mc(les,0,f"Translate: '{prompt}'",answer, [answer,"No sé","Aquí","Allá"]),
            wb(les,1,f"Translate: '{prompt}'",answer,opts),
            ta(les,2,f"Write in Spanish: '{prompt}'",answer),
            fb(les,3,"_____ a la derecha (Turn right)","Gira",["Gira","Sigue","Para"]),
            mp(les,4,"Match directions",[{"left":"left","right":"izquierda"},{"left":"right","right":"derecha"},{"left":"straight","right":"recto"},{"left":"corner","right":"esquina"}]),
        ])

    # ── Skill 2.2: Hotel ──────────────────────────────────────────────────────
    sk_hotel = Skill(unit=u2, order_index=1, title="Hotel", icon_name="🏨", total_lessons=3)
    db.add(sk_hotel); db.flush()

    hotel_lessons = [
        ("I have a reservation","Tengo una reserva",["Tengo","una","reserva","habitación"]),
        ("I need a room for two nights","Necesito una habitación para dos noches",["Necesito","una","habitación","para","dos","noches"]),
        ("What time is checkout?","¿A qué hora es la salida?",["¿A","qué","hora","es","la","salida?","entrada?"]),
    ]
    for i,(eng,esp,bank) in enumerate(hotel_lessons):
        les = Lesson(skill=sk_hotel, order_index=i, xp_reward=10); db.add(les); db.flush()
        db.add_all([
            mc(les,0,f"Translate: '{eng}'",esp,[esp,"No tengo","Quiero comer","Hasta luego"]),
            wb(les,1,f"Translate: '{eng}'",esp,bank),
            ta(les,2,f"Write in Spanish: '{eng}'",esp),
            fb(les,3,"La habitación está en el tercer _____ (The room is on the third floor)","piso",["piso","cuarto","hotel"]),
            mp(les,4,"Match hotel words",[{"left":"room","right":"habitación"},{"left":"key","right":"llave"},{"left":"floor","right":"piso"},{"left":"reservation","right":"reserva"}]),
        ])

    # ── Skill 2.3: Shopping ───────────────────────────────────────────────────
    sk_shop = Skill(unit=u2, order_index=2, title="Shopping", icon_name="🛍️", total_lessons=3)
    db.add(sk_shop); db.flush()

    shop_lessons = [
        ("How much does this cost?","¿Cuánto cuesta esto?",["¿Cuánto","cuesta","esto?","eso?"]),
        ("I would like to buy this shirt","Quisiera comprar esta camisa",["Quisiera","comprar","esta","camisa","falda"]),
        ("Do you have it in a larger size?","¿Lo tiene en una talla más grande?",["¿Lo","tiene","en","una","talla","más","grande?","pequeña?"]),
    ]
    for i,(eng,esp,bank) in enumerate(shop_lessons):
        les = Lesson(skill=sk_shop, order_index=i, xp_reward=10); db.add(les); db.flush()
        db.add_all([
            mc(les,0,f"Translate: '{eng}'",esp,[esp,"No quiero","Está bien","Hasta mañana"]),
            wb(les,1,f"Translate: '{eng}'",esp,bank),
            ta(les,2,f"Write: '{eng}' in Spanish",esp),
            fb(les,3,"Es muy _____ (It's very expensive)","caro",["caro","barato","grande"]),
            mp(les,4,"Match shopping words",[{"left":"cheap","right":"barato"},{"left":"expensive","right":"caro"},{"left":"shirt","right":"camisa"},{"left":"size","right":"talla"}]),
        ])

    # ═══════════════════════════════════════════════════════════════════════════
    # UNIT 3 — DAILY LIFE
    # ═══════════════════════════════════════════════════════════════════════════
    u3 = Unit(course=course, order_index=2, title="Daily Life",
              description="Talk about everyday activities", color="#CE82FF")
    db.add(u3); db.flush()

    daily_skills = [
        ("Work",    "💼", [
            ("I work in an office","Trabajo en una oficina",["Trabajo","en","una","oficina","casa"]),
            ("My job is interesting","Mi trabajo es interesante",["Mi","trabajo","es","interesante","aburrido"]),
            ("I have a meeting at ten","Tengo una reunión a las diez",["Tengo","una","reunión","a","las","diez"]),
        ]),
        ("Hobbies", "🎮", [
            ("I like to read books","Me gusta leer libros",["Me","gusta","leer","libros","películas"]),
            ("I play football on weekends","Juego fútbol los fines de semana",["Juego","fútbol","los","fines","de","semana"]),
            ("I love listening to music","Me encanta escuchar música",["Me","encanta","escuchar","música","leer"]),
        ]),
        ("Weather", "🌤️", [
            ("What is the weather like today?","¿Qué tiempo hace hoy?",["¿Qué","tiempo","hace","hoy?","mañana?"]),
            ("It is raining outside","Está lloviendo afuera",["Está","lloviendo","afuera","nevando"]),
            ("The sun is shining","El sol está brillando",["El","sol","está","brillando","lloviendo"]),
        ]),
    ]

    for sk_idx, (sk_title, sk_icon, lessons_data) in enumerate(daily_skills):
        sk = Skill(unit=u3, order_index=sk_idx, title=sk_title, icon_name=sk_icon, total_lessons=3)
        db.add(sk); db.flush()

        for i, (eng, esp, bank) in enumerate(lessons_data):
            les = Lesson(skill=sk, order_index=i, xp_reward=10); db.add(les); db.flush()
            db.add_all([
                mc(les,0,f"Translate: '{eng}'",esp,[esp,"No sé","Hasta luego","De acuerdo"]),
                wb(les,1,f"Translate: '{eng}'",esp,bank),
                ta(les,2,f"Write in Spanish: '{eng}'",esp),
                fb(les,3,"Hoy hace mucho _____ (Today it's very hot)","calor",["calor","frío","viento"]),
                mp(les,4,"Match daily words",[{"left":"sun","right":"sol"},{"left":"rain","right":"lluvia"},{"left":"hot","right":"calor"},{"left":"cold","right":"frío"}]),
            ])

    # ── Enroll learner + set progress (Unit 1 done, Unit 2 started) ───────────
    db.add(UserCourseProgress(user_id=1, course_id=course.id))
    db.flush()

    # Mark all Unit 1 skills + lessons as complete for learner
    for skill in [sk_greet, sk_fam, sk_food]:
        sp = UserSkillProgress(
            user_id=1, skill_id=skill.id,
            lessons_completed=skill.total_lessons,
            crown_level=1, is_unlocked=True,
            completed_at=datetime.utcnow(),
        )
        db.add(sp)
        for lesson in skill.lessons:
            db.add(UserLessonProgress(
                user_id=1, lesson_id=lesson.id, completed=True,
                xp_earned=lesson.xp_reward, completed_at=datetime.utcnow(),
            ))

    # Unlock Unit 2 Directions, mark first lesson done
    db.add(UserSkillProgress(user_id=1, skill_id=sk_dir.id, lessons_completed=1,
                              crown_level=0, is_unlocked=True))
    db.add(UserLessonProgress(user_id=1, lesson_id=sk_dir.lessons[0].id,
                               completed=True, xp_earned=10, completed_at=datetime.utcnow()))
    db.add(UserSkillProgress(user_id=1, skill_id=sk_hotel.id, lessons_completed=0,
                              crown_level=0, is_unlocked=True))

    db.commit()
    print("✅ Database seeded successfully!")
    print(f"   Course: Spanish (id={course.id})")
    print(f"   Units: 3  |  Skills: 9  |  Lessons: 27")
    print(f"   Default learner: id=1 (username='learner')")
    db.close()


def seed_if_empty() -> None:
    """Seed demo data only when the database has no users (safe for deploy)."""
    init_db()
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return
    finally:
        db.close()
    seed()


if __name__ == "__main__":
    seed()
