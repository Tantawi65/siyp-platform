import sqlite3

programs = [
    ("Google Summer of Code (GSoC)", "Google", "Global", "A global, online program focused on bringing new contributors into open source software development."),
    ("Fulbright Foreign Student Program", "US Department of State", "USA", "Enables graduate students, young professionals and artists from abroad to study and conduct research in the United States."),
    ("Chevening Scholarship", "UK Government", "UK", "The UK government's international awards program aimed at developing global leaders."),
    ("Erasmus Mundus Joint Master Degrees", "European Union", "Europe", "Prestigious, integrated, international study programmes, jointly delivered by an international consortium of higher education institutions."),
    ("DAAD Scholarships", "German Academic Exchange Service", "Germany", "Offers funding to international students for studying in Germany."),
    ("Schwarzman Scholars", "Tsinghua University", "China", "A highly selective, one-year master's program at Tsinghua University in Beijing."),
    ("Knight-Hennessy Scholars", "Stanford University", "USA", "Cultivates and supports a highly-engaged, multidisciplinary and multicultural community of graduate students from across Stanford University."),
    ("Gates Cambridge Scholarships", "Cambridge University", "UK", "Highly competitive full-cost scholarships awarded to outstanding applicants from countries outside the UK."),
    ("Rhodes Scholarships", "Oxford University", "UK", "The oldest international fellowship awards in the world."),
    ("McCall MacBain Scholarships", "McGill University", "Canada", "A full graduate scholarship that provides students with the mentorship, interdisciplinary learning, and global community they need to accelerate their impact."),
    ("Yenching Academy", "Peking University", "China", "A fully funded master's program in China Studies for outstanding graduates from all over the globe."),
    ("Eiffel Excellence Scholarship Program", "French Ministry for Europe and Foreign Affairs", "France", "Enables French higher education institutions to attract top foreign students to enroll in their masters and PhD programs."),
    ("Swiss Government Excellence Scholarships", "Swiss Government", "Switzerland", "Promotes international exchange and research cooperation between Switzerland and over 180 other countries."),
    ("Hubert H. Humphrey Fellowship Program", "US Department of State", "USA", "Provides a year of professional enrichment in the United States for experienced professionals from designated countries."),
    ("Australia Awards Scholarships", "Australian Government", "Australia", "Provide opportunities for people from developing countries to undertake full time undergraduate or postgraduate study at participating Australian universities."),
    ("MEXT Scholarship", "Ministry of Education, Culture, Sports, Science and Technology", "Japan", "Offers scholarships to international students who wish to study in graduate courses at Japanese universities."),
    ("Banting Postdoctoral Fellowships", "Government of Canada", "Canada", "Provides funding to the very best postdoctoral applicants, both nationally and internationally."),
    ("Marie Skłodowska-Curie Actions", "European Commission", "Europe", "Provides grants for all stages of researchers' careers and encourages transnational, intersectoral and interdisciplinary mobility."),
    ("CERN Summer Student Program", "CERN", "Switzerland", "Offers undergraduate and master students in physics, computing, engineering and maths a unique opportunity to join in the day-to-day work of research teams participating in experiments at CERN."),
    ("Microsoft Leap Apprenticeship", "Microsoft", "USA", "A 16-week, immersive program that provides real-world experience for those from non-traditional academic backgrounds."),
    ("Facebook/Meta University", "Meta", "USA", "A hands-on, immersive program that enables students from underrepresented communities to get to know Meta's people, products and services."),
    ("MLH Fellowship", "Major League Hacking", "Global", "A remote internship alternative for aspiring technologists."),
    ("Crossref Ambassador Program", "Crossref", "Global", "An opportunity for passionate individuals to represent Crossref within their communities."),
    ("GitHub Campus Experts", "GitHub", "Global", "Learn the skills to build and grow diverse technology communities on campus."),
    ("Microsoft Learn Student Ambassadors", "Microsoft", "Global", "A global group of on-campus ambassadors who are eager to help students and their communities."),
    ("Google Developer Student Clubs", "Google", "Global", "University based community groups for students interested in Google developer technologies."),
    ("Kaggle Days", "Kaggle", "Global", "A series of offline events for Kaggle community members."),
    ("AWS Educate Cloud Ambassador", "Amazon", "Global", "A program for educators and students who are passionate about teaching and learning cloud computing."),
    ("OIST Research Internship", "Okinawa Institute of Science and Technology", "Japan", "Provides students with the opportunity to gain experience in a particular laboratory or to learn a specific technique."),
    ("LPI Summer Internship", "Lunar and Planetary Institute", "USA", "Provides undergraduates with an opportunity to participate in cutting-edge research in the planetary sciences."),
    ("Summer Research Opportunity Program (SROP)", "Big Ten Academic Alliance", "USA", "A gateway to graduate education at Big Ten Academic Alliance universities."),
    ("Amgen Scholars Program", "Amgen Foundation", "Global", "An international program that provides undergraduates with the opportunity to engage in hands-on research."),
    ("Max Planck Internships", "Max Planck Society", "Germany", "Offers highly motivated students the opportunity to conduct a research project."),
    ("EMBO Fellowships", "European Molecular Biology Organization", "Europe", "Supports excellent researchers at all stages of their careers."),
    ("Human Frontier Science Program", "HFSP", "Global", "Promotes fundamental research in the life sciences with special emphasis on novel and interdisciplinary research."),
    ("Wellcome Trust Fellowships", "Wellcome", "UK", "Supports researchers to take on important questions relating to life, health and wellbeing."),
    ("Croucher Scholarships", "Croucher Foundation", "Hong Kong", "Awards for promising young people in Hong Kong to pursue scientific research overseas."),
    ("A*STAR Graduate Academy Scholarships", "A*STAR", "Singapore", "Offers various scholarships and fellowships for pursuing PhD and postdoctoral research in Singapore."),
    ("TWAS Fellowships", "The World Academy of Sciences", "Global", "Offers fellowships to scientists from developing countries to pursue research."),
    ("World Bank Scholarships", "World Bank", "Global", "Provides opportunities for graduate study for mid-career professionals from developing countries."),
    ("Asian Development Bank - Japan Scholarship", "ADB", "Asia", "Provides an opportunity for well-qualified citizens of ADB's developing member countries to undertake postgraduate studies."),
    ("OPEC Fund for International Development Scholarship", "OFID", "Global", "Aims to help highly motivated, highly driven individuals overcome one of the biggest challenges to their careers – the cost of graduate studies."),
    ("Joint Japan/World Bank Graduate Scholarship", "World Bank", "Global", "Open to women and men from developing countries with relevant professional experience and a history of supporting their countries' development efforts."),
    ("Aga Khan Foundation Scholarship", "Aga Khan Foundation", "Global", "Provides a limited number of scholarships each year for postgraduate studies to outstanding students from select developing countries."),
    ("Rotary Peace Fellowships", "Rotary International", "Global", "Each year, Rotary awards up to 130 fully funded fellowships for dedicated leaders from around the world to study at one of our peace centers."),
    ("Ford Foundation Fellowship Programs", "Ford Foundation", "USA", "Seeks to increase the diversity of the nation's college and university faculties."),
    ("Paul and Daisy Soros Fellowships for New Americans", "Soros Foundation", "USA", "Supports outstanding immigrants and children of immigrants who are pursuing a graduate education in the United States."),
    ("Jack Kent Cooke Foundation Graduate Scholarship", "Jack Kent Cooke Foundation", "USA", "For high-achieving college seniors and recent graduates with financial need who are pursuing graduate or professional degrees."),
    ("National Science Foundation Graduate Research Fellowship", "NSF", "USA", "Recognizes and supports outstanding graduate students in NSF-supported STEM disciplines who are pursuing research-based master's and doctoral degrees."),
    ("Hertz Foundation Fellowships", "Hertz Foundation", "USA", "Supports graduate students working towards the Ph.D. degree in the applied physical, biological and engineering sciences.")
]

db_path = "E:\\University Programs\\SIYP\\SIYP Anti\\sql_app.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Insert the programs
for prog in programs:
    # Check if exists to avoid duplicates if run multiple times
    cursor.execute("SELECT id FROM programs_catalog WHERE name = ?", (prog[0],))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO programs_catalog (name, organization, country, description, verified) VALUES (?, ?, ?, ?, 1)", prog)

conn.commit()
conn.close()
print(f"Successfully seeded {len(programs)} programs.")
