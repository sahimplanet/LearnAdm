import { Subject } from "../types";

export const DEFAULT_SUBJECTS: Subject[] = [
  // ==================== GRADE 1 ====================
  {
    id: "g1-math",
    name: "Mathematics",
    description: "Grade 1 foundation numeracy: Master counting, simple adding and subtracting, and shape patterns.",
    iconName: "Calculator",
    grade: 1,
    topics: [
      { id: "g1-math-counting", name: "Numbers and Counting", description: "Count forward and backward up to 100 using daily familiar objects." },
      { id: "g1-math-addition", name: "Addition within 20", description: "Combine quantities together and learn the basic '+' sign logic." },
      { id: "g1-math-shapes", name: "Geometric Shapes & Patterns", description: "Identify basic shapes like circles, triangles, and squares in the classroom." }
    ]
  },
  {
    id: "g1-english",
    name: "English",
    description: "Grade 1 foundation literacy: Learn letter sounds, naming words, and short sentence structures.",
    iconName: "BookOpen",
    grade: 1,
    topics: [
      { id: "g1-eng-phonics", name: "Phonics & Letter Sounds", description: "Recognize letters, pronounce their sounds, and read simple three-letter words." },
      { id: "g1-eng-nouns", name: "Naming Words (Nouns)", description: "Identify naming words for family members, animals, and common toys." },
      { id: "g1-eng-greetings", name: "Polite Greetings", description: "Practice simple, courteous morning and evening social expressions." }
    ]
  },
  {
    id: "g1-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 1: Jifunze kusoma sauti za herufi, msamiati na maamkizi mepesi.",
    iconName: "Languages",
    grade: 1,
    topics: [
      { id: "g1-kis-herufi", name: "Sauti za Herufi na Silabi", description: "Kusoma sauti za herufi na kuunda silabi rahisi kama ba, ta, ma." },
      { id: "g1-kis-nyumba", name: "Msamiati wa Nyumbani", description: "Kujifunza majina ya vitu vinavyopatikana nyumbani na jikoni kwetu." },
      { id: "g1-kis-adabu", name: "Maamkizi na Adabu", description: "Kutumia maneno ya heshima kama 'Shikamoo', 'Hujambo', na 'Asante'." }
    ]
  },
  {
    id: "g1-science",
    name: "Integrated Science",
    description: "Grade 1 basic environment: Discover human senses, personal hygiene, and weather types.",
    iconName: "FlaskConical",
    grade: 1,
    topics: [
      { id: "g1-sci-hygiene", name: "My Body & Cleanliness", description: "Master proper hand washing, teeth brushing, and nail care routines." },
      { id: "g1-sci-senses", name: "The Five Senses", description: "Learn how sight, sound, smell, taste, and touch help us explore." },
      { id: "g1-sci-weather", name: "Our Weather Daily Changes", description: "Observe sunny, rainy, windy, and cloudy weather patterns outside." }
    ]
  },
  {
    id: "g1-social",
    name: "Social Studies",
    description: "Grade 1 identity: Understand our immediate family, school friends, and safe pathways.",
    iconName: "Compass",
    grade: 1,
    topics: [
      { id: "g1-soc-family", name: "My Family Members", description: "Appreciate different family structures and sharing chores at home." },
      { id: "g1-soc-school", name: "My New School Friends", description: "Learn names of school workers, playground safety, and working together." },
      { id: "g1-soc-safety", name: "Road Safety Rules", description: "Identify simple road signs and safe behavior when walking to school." }
    ]
  },
  {
    id: "g1-religion",
    name: "Religious Education",
    description: "Grade 1 values: Moral stories, sharing, kindness, and thanking family members.",
    iconName: "Heart",
    grade: 1,
    topics: [
      { id: "g1-rel-creation", name: "Creation & Appreciating Me", description: "Understand how special we are and caring for other animals." },
      { id: "g1-rel-sharing", name: "Sharing and Caring", description: "Learn values of sharing toys and food with friends and family." },
      { id: "g1-rel-respect", name: "Respecting Parents", description: "Express gratitude to parents, elders, and helpful guardians." }
    ]
  },
  {
    id: "g1-arts",
    name: "Creative Arts",
    description: "Grade 1 creative expression: Finger painting, simple coloring, and rhythm games.",
    iconName: "Palette",
    grade: 1,
    topics: [
      { id: "g1-art-painting", name: "Finger Painting & Colors", description: "Explore finger paint textures and identify basic primary colors." },
      { id: "g1-art-singing", name: "Sing-along Action Songs", description: "Sing traditional kids' games, clap beats, and keep steady rhythms." },
      { id: "g1-art-folding", name: "Tearing & Folding Crafts", description: "Develop motor skills by safely tearing and folding paper shapes." }
    ]
  },
  {
    id: "g1-agriculture",
    name: "Agriculture",
    description: "Grade 1 gardening: Learning basic plant watering, soil feel, and familiar farm animals.",
    iconName: "Sprout",
    grade: 1,
    topics: [
      { id: "g1-agr-watering", name: "Watering Garden Crops", description: "Learn to water container gardens and school vegetable beds." },
      { id: "g1-agr-animals", name: "Our Domestic Animals", description: "Identify cows, hens, and sheep, and understand what they provide." },
      { id: "g1-agr-cleanup", name: "Caring for Farm Beds", description: "Help collect dried leaves and weeds to keep farm beds neat." }
    ]
  },

  // ==================== GRADE 2 ====================
  {
    id: "g2-math",
    name: "Mathematics",
    description: "Grade 2 numeracy: Subtracting within 100, introduction to multiplication, and measuring with rulers.",
    iconName: "Calculator",
    grade: 2,
    topics: [
      { id: "g2-math-subtraction", name: "Subtraction within 100", description: "Solve subtraction word problems using standard regrouping lines." },
      { id: "g2-math-multiplication", name: "Intro to Multiplication", description: "Understand multiplication as repeated addition (e.g. 2+2+2 = 2 x 3)." },
      { id: "g2-math-measurement", name: "Measuring in Centimeters", description: "Use rulers to measure lengths of books, pencils, and desks accurately." }
    ]
  },
  {
    id: "g2-english",
    name: "English",
    description: "Grade 2 literacy: Compound words, proper punctuation, and short descriptive storytelling.",
    iconName: "BookOpen",
    grade: 2,
    topics: [
      { id: "g2-eng-punctuation", name: "Capital Letters & Full Stops", description: "Identify where to use capital letters, question marks, and full stops." },
      { id: "g2-eng-compound", name: "Fun with Compound Words", description: "Join small words to make new ones (like sun + flower = sunflower)." },
      { id: "g2-eng-describing", name: "Describing Words (Adjectives)", description: "Use colorful adjectives to describe size, color, and feelings." }
    ]
  },
  {
    id: "g2-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 2: Kusoma maneno ya vitendo, kukanusha, na adabu za shuleni.",
    iconName: "Languages",
    grade: 2,
    topics: [
      { id: "g2-kis-vitendo", name: "Maneno ya Vitendo (Vitenzi)", description: "Kutambua na kuandika vitendo kama 'kimbia', 'andika', na 'cheka'." },
      { id: "g2-kis-kukanusha", name: "Kukanusha Sentensi Rahisi", description: "Kubadilisha sentensi kuwa hali ya 'siyo' au 'hapana' (mfano: Anasoma - Hasomi)." },
      { id: "g2-kis-darasa", name: "Lugha ya Heshima Darasani", description: "Kujifunza kuomba ruhusa kwa nidhamu dhabiti darasani." }
    ]
  },
  {
    id: "g2-science",
    name: "Integrated Science",
    description: "Grade 2 scientific world: Study domestic animals, dental care, and shadows.",
    iconName: "FlaskConical",
    grade: 2,
    topics: [
      { id: "g2-sci-dental", name: "Dental Health & Care", description: "Understand structure of teeth, why cavities form, and tooth-friendly foods." },
      { id: "g2-sci-animals", name: "Habitats of Domestic Animals", description: "Explore cow sheds, stables, and nests where farm animals rest safely." },
      { id: "g2-sci-shadows", name: "Playing with Shadows", description: "Observe how blocks block sunlight and change shadow lengths during the day." }
    ]
  },
  {
    id: "g2-social",
    name: "Social Studies",
    description: "Grade 2 community: Identify neighborhood leaders, water sources, and keeping clean.",
    iconName: "Compass",
    grade: 2,
    topics: [
      { id: "g2-soc-leaders", name: "Our Neighborhood Leaders", description: "Learn about the duties of chiefs, headteachers, and local elders." },
      { id: "g2-soc-water", name: "Local Water Sources", description: "Recognize rivers, wells, and rainwater harvesting structures." },
      { id: "g2-soc-waste", name: "Keeping Our Village Clean", description: "Master correct rubbish disposal and picking litter to protect health." }
    ]
  },
  {
    id: "g2-religion",
    name: "Religious Education",
    description: "Grade 2 values: Honesty, helping older family members, and playing peacefully.",
    iconName: "Heart",
    grade: 2,
    topics: [
      { id: "g2-rel-honesty", name: "The Value of Honesty", description: "Discuss why telling the truth build deep trust with parents and friends." },
      { id: "g2-rel-elders", name: "Helping Our Elders", description: "Learn practical ways to assist grandparents and community elders safely." },
      { id: "g2-rel-peace", name: "Playing Peacefully", description: "Resolve minor playground conflicts with kindness and apologizing." }
    ]
  },
  {
    id: "g2-arts",
    name: "Creative Arts",
    description: "Grade 2 arts: Making simple paper bag puppets, primary color mixing, and drumming.",
    iconName: "Palette",
    grade: 2,
    topics: [
      { id: "g2-art-puppets", name: "Paper Bag Puppets", description: "Construct simple animal faces on paper bags for storytelling sessions." },
      { id: "g2-art-secondary", name: "Secondary Colors Mixing", description: "Combine blue and yellow to create green, red and yellow to make orange." },
      { id: "g2-art-rhythm", name: "Drumming & Shaker Beats", description: "Build handmade shakers using bottles and seeds to play percussion beats." }
    ]
  },
  {
    id: "g2-agriculture",
    name: "Agriculture",
    description: "Grade 2 crops: Sowing big seeds, identifying soil feel, and making garden pathways.",
    iconName: "Sprout",
    grade: 2,
    topics: [
      { id: "g2-agr-sowing", name: "Sowing Bean & Maize Seeds", description: "Master appropriate seed depth and safe soil coverage in vegetable pots." },
      { id: "g2-agr-soil", name: "The Feel of Sand & Mud", description: "Examine sandy soil and clay muddy soil by rolling them into balls." },
      { id: "g2-agr-pathways", name: "Garden Pathway Sweeping", description: "Understand how sweeping and picking weeds keeps pests away from crops." }
    ]
  },

  // ==================== GRADE 3 ====================
  {
    id: "g3-math",
    name: "Mathematics",
    description: "Grade 3 numeracy: Division basics, fractions introduction, and currency math.",
    iconName: "Calculator",
    grade: 3,
    topics: [
      { id: "g3-math-division", name: "Basic Division & Sharing", description: "Divide objects equally among groups and grasp the concept of reminders." },
      { id: "g3-math-fractions", name: "Fractions (Half, Quarter)", description: "Identify equal fractional slices of circles and rectangular papers." },
      { id: "g3-math-money", name: "Shopping and Change Math", description: "Calculate total shop items costs and correct balance change back." }
    ]
  },
  {
    id: "g3-english",
    name: "English",
    description: "Grade 3 literacy: Plural forms, irregular verbs, and writing short paragraphs.",
    iconName: "BookOpen",
    grade: 3,
    topics: [
      { id: "g3-eng-plurals", name: "Regular and Irregular Plurals", description: "Transform nouns from singular to plural (e.g. child -> children, cat -> cats)." },
      { id: "g3-eng-verbs", name: "Past and Present Verb Tense", description: "Master irregular past verbs like went, wrote, and ate." },
      { id: "g3-eng-paragraph", name: "Structuring a Short Paragraph", description: "Write 3-4 cohesive sentences centering a single interesting topic." }
    ]
  },
  {
    id: "g3-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 3: Umoja na wingi, kulinganisha sifa, na kuandika hadithi fupi.",
    iconName: "Languages",
    grade: 3,
    topics: [
      { id: "g3-kis-umoja", name: "Umoja na Wingi wa Nomino", description: "Kujifunza kubadilisha majina ya kawaida kuwa wingi (Kiti - Viti, Mtoto - Watoto)." },
      { id: "g3-kis-sifa", name: "Kuelezea Tabia na Sifa", description: "Kutumia vivumishi kueleza rangi, urefu na tabia ya watu au vitu." },
      { id: "g3-kis-hadithi", name: "Kuandika Kisa Fupi", description: "Kuandika aya 4 zinazohusu likizo au mchezo unaoupenda." }
    ]
  },
  {
    id: "g3-science",
    name: "Integrated Science",
    description: "Grade 3 scientific world: Plant parts, animal movement, and water purification.",
    iconName: "FlaskConical",
    grade: 3,
    topics: [
      { id: "g3-sci-plants", name: "Roots, Stems & Leaves", description: "Identify main roles of roots, stems, and leaves in delivering nutrition." },
      { id: "g3-sci-movement", name: "How Different Animals Move", description: "Contrast flying, crawling, slithering, swimming, and running structures." },
      { id: "g3-sci-purify", name: "Simple Water Filtering", description: "Construct a simple home filter using clean sand, gravel, and cloth." }
    ]
  },
  {
    id: "g3-social",
    name: "Social Studies",
    description: "Grade 3 community: Basic mapping directions, transport types, and historic landmarks.",
    iconName: "Compass",
    grade: 3,
    topics: [
      { id: "g3-soc-cardinal", name: "The Four Cardinal Directions", description: "Learn to locate North, South, East, and West using morning shadows." },
      { id: "g3-soc-transport", name: "Means of Transport", description: "Differentiate road, rail, air, and water transport advantages." },
      { id: "g3-soc-history", name: "Local Historical Sites", description: "Discover monuments, museums, and natural legacy points in our sub-county." }
    ]
  },
  {
    id: "g3-religion",
    name: "Religious Education",
    description: "Grade 3 values: Empathy, resolving school arguments, and self-discipline.",
    iconName: "Heart",
    grade: 3,
    topics: [
      { id: "g3-rel-empathy", name: "Empathy & Inclusion", description: "Learn how to welcome and support lonely or disabled school peers." },
      { id: "g3-rel-resolving", name: "Resolving Daily Conflicts", description: "Master words that cool anger and finding teachers to arbitrate fairly." },
      { id: "g3-rel-discipline", name: "Self-Discipline & Homework", description: "Recognize the long-term benefits of finishing home assignments early." }
    ]
  },
  {
    id: "g3-arts",
    name: "Creative Arts",
    description: "Grade 3 crafts: Clay modeling, weaving simple patterns, and basic drama roles.",
    iconName: "Palette",
    grade: 3,
    topics: [
      { id: "g3-art-clay", name: "Clay Pot Modeling", description: "Learn pinch-pot methods to shape cute animals or pots from moist clay." },
      { id: "g3-art-weaving", name: "Weaving Simple Mats", description: "Construct small colorful mats using standard sisal strings or dry banana fibers." },
      { id: "g3-art-drama", name: "Skit Acting & Expressions", description: "Use voice pitches and dramatic facial expressions to portray characters." }
    ]
  },
  {
    id: "g3-agriculture",
    name: "Agriculture",
    description: "Grade 3 farming: Identifying weeds, making organic mulch, and feeding poultry.",
    iconName: "Sprout",
    grade: 3,
    topics: [
      { id: "g3-agr-weeds", name: "Identifying Common Weeds", description: "Recognize black-jack and other stubborn weeds stealing crop water." },
      { id: "g3-agr-mulch", name: "Covering Soil with Dry Grass", description: "Understand how grass mulching blocks direct evaporation and retains moisture." },
      { id: "g3-agr-poultry", name: "Caring for Farm Chicks", description: "Learn what food chicks feed on and keeping their drinking trays pristine." }
    ]
  },

  // ==================== GRADE 4 ====================
  {
    id: "g4-math",
    name: "Mathematics",
    description: "Grade 4 intermediate math: Place value up to 10,000, multi-digit multiplying, and area calculations.",
    iconName: "Calculator",
    grade: 4,
    topics: [
      { id: "g4-math-placevalue", name: "Place Value to 10,000", description: "Read, write, and expand large digit numbers securely." },
      { id: "g4-math-multiplication", name: "Multi-digit Multiplication", description: "Multiply double digit numbers using structured columns." },
      { id: "g4-math-area", name: "Area of Rectangles", description: "Calculate total grid squares enclosed inside flat 2D surfaces (Length x Width)." }
    ]
  },
  {
    id: "g4-english",
    name: "English",
    description: "Grade 4 language: Conjunctions, reading complex comprehension texts, and email composition.",
    iconName: "BookOpen",
    grade: 4,
    topics: [
      { id: "g4-eng-conjunctions", name: "Linking Words (Conjunctions)", description: "Join clauses using connectives like because, although, and so." },
      { id: "g4-eng-comprehension", name: "Analyzing Passages", description: "Identify main characters, story settings, and central summary takeaways." },
      { id: "g4-eng-writing", name: "Drafting an Informal Letter", description: "Learn structure layout of sender address, date, and friendly greetings." }
    ]
  },
  {
    id: "g4-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 4: Ngeli ya A-WA, viunganishi vya sentensi, na ufahamu wa hadithi.",
    iconName: "Languages",
    grade: 4,
    topics: [
      { id: "g4-kis-ngeli", name: "Ngeli ya A-WA (Watu na Wanyama)", description: "Kujifunza kulinganisha vitenzi na vivumishi kwa majina ya watu na wanyama." },
      { id: "g4-kis-viunganishi", name: "Kuunganisha na Viunganishi", description: "Kutumia maneno kama 'kwa sababu', 'lakini' na 'kisha' kuunganisha sentensi." },
      { id: "g4-kis-ufahamu", name: "Ufahamu na Kujibu Maswali", description: "Kusoma taarifa na kujibu maswali kuhusu maadili na mazingira." }
    ]
  },
  {
    id: "g4-science",
    name: "Integrated Science",
    description: "Grade 4 science: Separation of solids, types of teeth, and electric torch circuit.",
    iconName: "FlaskConical",
    grade: 4,
    topics: [
      { id: "g4-sci-separating", name: "Separating Mixed Solids", description: "Use hand picking, winnowing, and sieving methods to divide grains." },
      { id: "g4-sci-teeth", name: "Incisors, Canines & Molars", description: "Study structure, locations, and unique cutting functions of our teeth." },
      { id: "g4-sci-circuits", name: "Inside a Simple Torch", description: "Understand wires, dry cells, switches, and bulbs that form a circuit." }
    ]
  },
  {
    id: "g4-social",
    name: "Social Studies",
    description: "Grade 4 geography: County features, local climate patterns, and physical landforms.",
    iconName: "Compass",
    grade: 4,
    topics: [
      { id: "g4-soc-county", name: "Physical Features of Our County", description: "Locate local mountains, valleys, and river basins on county maps." },
      { id: "g4-soc-climate", name: "Factors Influencing Climate", description: "Analyze how winds, high altitude, and forest cover dictate rainfall." },
      { id: "g4-soc-resources", name: "County Mineral Resources", description: "Investigate quarries, water basins, and agricultural areas powering trade." }
    ]
  },
  {
    id: "g4-religion",
    name: "Religious Education",
    description: "Grade 4 values: Integrity, respecting other religions, and environmental protection.",
    iconName: "Heart",
    grade: 4,
    topics: [
      { id: "g4-rel-integrity", name: "The Practice of Integrity", description: "Discuss standing up for truth even under peer pressure." },
      { id: "g4-rel-diversity", name: "Respecting Other Faiths", description: "Learn about different faith structures and live together harmoniously." },
      { id: "g4-rel-earth", name: "Caring for the Earth", description: "Explore religious duties to protect wildlife, water, and forests." }
    ]
  },
  {
    id: "g4-arts",
    name: "Creative Arts",
    description: "Grade 4 craft: Mosaic patterns, basic color wheels, and flute blowing.",
    iconName: "Palette",
    grade: 4,
    topics: [
      { id: "g4-art-mosaic", name: "Paper & Seed Mosaic Art", description: "Create visual images by gluing small grains, seeds, and colored paper chips." },
      { id: "g4-art-wheel", name: "The Primary Color Wheel", description: "Draw and color standard primary and secondary wedges on cardboard wheels." },
      { id: "g4-art-flute", name: "Blowing Simple Recorder Flutes", description: "Learn proper finger hole covering to blow steady musical pitches." }
    ]
  },
  {
    id: "g4-agriculture",
    name: "Agriculture",
    description: "Grade 4 farming: Soil profile layers, compost heap construction, and poultry feeds.",
    iconName: "Sprout",
    grade: 4,
    topics: [
      { id: "g4-agr-compost", name: "Constructing a Compost Heap", description: "Layer dry weeds, manure, ash, and water to formulate organic compost fertilizer." },
      { id: "g4-agr-soilprofile", name: "Investigating Soil Profile Layers", description: "Examine topsoil, subsoil, substratum, and bedrock in deep ground cuts." },
      { id: "g4-agr-poultry", name: "Formulating Chicks Mash", description: "Learn composition of starter, growers, and layers feeds for farming birds." }
    ]
  },

  // ==================== GRADE 5 ====================
  {
    id: "g5-math",
    name: "Mathematics",
    description: "Grade 5 arithmetic: Master long division, decimal calculations, and calculating volume.",
    iconName: "Calculator",
    grade: 5,
    topics: [
      { id: "g5-math-division", name: "Long Division with 2-digit Divisors", description: "Divide large numbers using sequential division, multiplication, subtraction, and bring-down steps." },
      { id: "g5-math-decimals", name: "Adding and Subtracting Decimals", description: "Align decimal points perfectly to solve math problems." },
      { id: "g5-math-volume", name: "Volume of Cubes & Cuboids", description: "Determine total volumetric spaces (Length x Width x Height) in cubic units." }
    ]
  },
  {
    id: "g5-english",
    name: "English",
    description: "Grade 5 language: Pronouns, identifying metaphors and similes, and story compositions.",
    iconName: "BookOpen",
    grade: 5,
    topics: [
      { id: "g5-eng-pronouns", name: "Pronoun-Antecedent Agreement", description: "Align singular and plural pronouns accurately with their matching nouns." },
      { id: "g5-eng-figures", name: "Metaphors and Similes", description: "Learn how comparing things using 'as' or 'like' makes writing rich." },
      { id: "g5-eng-narrative", name: "Writing a Narrative Story", description: "Organize stories into clear introductions, conflicts, and happy solutions." }
    ]
  },
  {
    id: "g5-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 5: Ngeli ya KI-VI, visawe na kinyume, na uandishi wa barua ya kirafiki.",
    iconName: "Languages",
    grade: 5,
    topics: [
      { id: "g5-kis-kivi", name: "Upatanisho wa Ngeli ya KI-VI", description: "Kujifunza kuelezea vitu kwa umoja na wingi (Kiti kimevunjika - Viti vimevunjika)." },
      { id: "g5-kis-visawe", name: "Visawe na Kinyume cha Maneno", description: "Kukusanya maneno yenye maana sawa na yale yenye maana kinyume." },
      { id: "g5-kis-barua", name: "Barua ya Kirafiki (Kisemina)", description: "Kuandika barua kwa rafiki yako kuelezea matukio ya kuvutia shuleni." }
    ]
  },
  {
    id: "g5-science",
    name: "Integrated Science",
    description: "Grade 5 biology & chemistry: Plant classification, properties of matter, and animal skeletal bones.",
    iconName: "FlaskConical",
    grade: 5,
    topics: [
      { id: "g5-sci-plants", name: "Flowering & Non-Flowering Plants", description: "Categorize plants based on flower, seed, and spore production structures." },
      { id: "g5-sci-matter", name: "Solids, Liquids & Gases", description: "Discover how heating or cooling changes matter properties and shapes." },
      { id: "g5-sci-bones", name: "The Human Skeleton Functions", description: "Study how bones support, protect organs, and assist muscle movement." }
    ]
  },
  {
    id: "g5-social",
    name: "Social Studies",
    description: "Grade 5 citizenship: Historic migration of Kenyan tribes, trade styles, and democratic voting.",
    iconName: "Compass",
    grade: 5,
    topics: [
      { id: "g5-soc-migration", name: "Migration of Kenyan Communities", description: "Trace movement of Bantu, Nilotes, and Cushites into early settlements." },
      { id: "g5-soc-trade", name: "Barter vs Currency Trade", description: "Compare exchange systems before modern coins and paper notes were introduced." },
      { id: "g5-soc-democracy", name: "Basics of Democratic Voting", description: "Understand why voting is a civic right and how fair campaigns function." }
    ]
  },
  {
    id: "g5-religion",
    name: "Religious Education",
    description: "Grade 5 values: Caring for widows, self-respect, and moral leadership.",
    iconName: "Heart",
    grade: 5,
    topics: [
      { id: "g5-rel-widows", name: "Caring for Vulnerable People", description: "Review religious duty to aid widows, orphans, and homeless neighbors." },
      { id: "g5-rel-selfrespect", name: "Developing Self-Respect", description: "Set healthy boundaries and resist harmful peer pressure." },
      { id: "g5-rel-leadership", name: "Qualities of Good Leaders", description: "Identify honesty, fairness, humility, and willingness to serve others." }
    ]
  },
  {
    id: "g5-arts",
    name: "Creative Arts",
    description: "Grade 5 performance: Stencil printmaking, singing patriotic songs, and stage plays.",
    iconName: "Palette",
    grade: 5,
    topics: [
      { id: "g5-art-stencil", name: "Stencil Leaf Printmaking", description: "Cut out card outlines to print beautiful repeating leaf patterns on paper." },
      { id: "g5-art-patriotic", name: "National & Patriotic Songs", description: "Master the national anthem lyrics and sing together in unified tempo." },
      { id: "g5-art-skit", name: "Writing a Short Skit Script", description: "Write simple dialogue lines for three actors to perform." }
    ]
  },
  {
    id: "g5-agriculture",
    name: "Agriculture",
    description: "Grade 5 crops: establishing crop nurseries, watering seedling tubes, and pest defense.",
    iconName: "Sprout",
    grade: 5,
    topics: [
      { id: "g5-agr-nursery", name: "Seedbed Nursery Design", description: "Create protected seedbeds to germinate delicate tomato or cabbage seeds." },
      { id: "g5-agr-tubes", name: "Watering Poly-tubes Seedlings", description: "Prick out germinated seedlings into plastic tubes for nursery hardening." },
      { id: "g5-agr-pests", name: "Natural Garden Pest Remedies", description: "Formulate organic garlic and pepper sprays to defend against garden bugs." }
    ]
  },

  // ==================== GRADE 6 ====================
  {
    id: "g6-math",
    name: "Mathematics",
    description: "Grade 6 math: Master percentage rates, solving ratio problems, and coordinate grids.",
    iconName: "Calculator",
    grade: 6,
    topics: [
      { id: "g6-math-percentages", name: "Applying Percentages in Life", description: "Apply percentage formulas to figure out discount prices and school grades." },
      { id: "g6-math-ratios", name: "Ratios and Proportions", description: "Compare quantities relative to each other (e.g. recipe mixing ratios 2:3)." },
      { id: "g6-math-coordinates", name: "The Four-Quadrant Grid", description: "Plot coordinate points (X, Y) across a flat grid intersection plane." }
    ]
  },
  {
    id: "g6-english",
    name: "English",
    description: "Grade 6 literature: Passive and active voice clauses, drafting formal essays, and analysis of poetry.",
    iconName: "BookOpen",
    grade: 6,
    topics: [
      { id: "g6-eng-voice", name: "Active and Passive voice", description: "Grasp how subjects receive or perform action verbs inside sentence frames." },
      { id: "g6-eng-essays", name: "Drafting an Argumentative Essay", description: "Compose thesis statements, back ideas with facts, and close with summaries." },
      { id: "g6-eng-poetry", name: "Rhyme Scheme & Stanzas in Poetry", description: "Locate end-line rhyme schemes (AABB, ABAB) and analyze stanzas." }
    ]
  },
  {
    id: "g6-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 6: Ngeli za LI-YA na YA-YA, barua rasmi ya kiofisi, na isimu jamii.",
    iconName: "Languages",
    grade: 6,
    topics: [
      { id: "g6-kis-ngeli", name: "Upatanisho wa Ngeli ya LI-YA", description: "Sentensi sahihi za nomino kama Jembe-Majembe na Tunda-Matunda." },
      { id: "g6-kis-barua", name: "Uandishi wa Barua Rasmi", description: "Jinsi ya kuandika barua rasmi ya kiofisi yenye anwani mbili na kichwa cha habari." },
      { id: "g6-kis-isimu", name: "Isimu Jamii (Matumizi ya Lugha)", description: "Kuchunguza jinsi Kiswahili kinavyotumiwa sokoni, darasani, na hospitalini." }
    ]
  },
  {
    id: "g6-science",
    name: "Integrated Science",
    description: "Grade 6 anatomy: human digestion system, acid indicator testing, and electromagnets.",
    iconName: "FlaskConical",
    grade: 6,
    topics: [
      { id: "g6-sci-digestion", name: "The Human Digestive System", description: "Trace path of food from mouth, stomach, to intestines, noting main enzymes." },
      { id: "g6-sci-acids", name: "Litmus Indicators Testing", description: "Test acids and bases using red and blue litmus papers." },
      { id: "g6-sci-electromagnet", name: "Building an Electromagnet", description: "Wrap copper wire around an iron nail and connect a battery to attract pins." }
    ]
  },
  {
    id: "g6-social",
    name: "Social Studies",
    description: "Grade 6 history: Eastern African trade, weather instruments, and citizen responsibilities.",
    iconName: "Compass",
    grade: 6,
    topics: [
      { id: "g6-soc-trade", name: "Early Long-Distance Trade", description: "Study historical trade networks between Eastern Africa and other lands." },
      { id: "g6-soc-weather", name: "Siting Weather Instruments", description: "Understand rain gauges, wind vanes, and Stevenson screens in weather stations." },
      { id: "g6-soc-citizen", name: "Rights and Duties of Citizens", description: "Discuss paying taxes, reporting crimes, and guarding our common environment." }
    ]
  },
  {
    id: "g6-religion",
    name: "Religious Education",
    description: "Grade 6 values: Stewardship, peaceful community coexistence, and helping friends in need.",
    iconName: "Heart",
    grade: 6,
    topics: [
      { id: "g6-rel-stewardship", name: "Environmental Stewardship", description: "Look at spiritual calls to plant trees and block water wastage." },
      { id: "g6-rel-peace", name: "Peaceful Coexistence", description: "Build friendships across different tribes and cultural backgrounds." },
      { id: "g6-rel-solidarity", name: "Helping Peers in Adversity", description: "Support classmates during family losses, accidents, or sickness." }
    ]
  },
  {
    id: "g6-arts",
    name: "Creative Arts",
    description: "Grade 6 crafts: Papier-mâché sculptures, playing standard recorders, and shadow plays.",
    iconName: "Palette",
    grade: 6,
    topics: [
      { id: "g6-art-papier", name: "Papier-mâché Bowls", description: "Mix soaked paper shreds with glue paste to mold durable bowls." },
      { id: "g6-art-recorder", name: "Playing Simple Melodies", description: "Play standard musical pieces on recorders following simple written notes." },
      { id: "g6-art-shadow", name: "Puppet Shadow Theatre", description: "Cut dark templates to throw silhouettes on backlit sheets." }
    ]
  },
  {
    id: "g6-agriculture",
    name: "Agriculture",
    description: "Grade 6 livestock: animal feeds classifications, soil health, and drip irrigation.",
    iconName: "Sprout",
    grade: 6,
    topics: [
      { id: "g6-agr-feeds", name: "Roughages vs Concentrates", description: "Differentiate high fiber grass roughages from dense protein concentrates feeds." },
      { id: "g6-agr-soilhealth", name: "Adding Organic Soil Mulch", description: "Layer crop residue leaves to retain topsoil nutrients and stop soil erosion." },
      { id: "g6-agr-drip", name: "Assembling Drip Irrigation", description: "Puncture standard hose pipes near crop stems to implement water drip lines." }
    ]
  },

  // ==================== GRADE 7 (2025 KICD CURRICULUM DESIGN) ====================
  {
    id: "g7-math",
    name: "Mathematics",
    description: "KICD Grade 7 Mathematics: Numbers, Algebra, Measurements, Geometry, and Data Handling.",
    iconName: "Calculator",
    grade: 7,
    topics: [
      { id: "g7-math-numbers", name: "Strand 1.0: Numbers", description: "Whole numbers up to 100M, divisibility tests (2-11), GCD/LCM factor method, fractions & reciprocals, decimals, squares & square roots." },
      { id: "g7-math-algebra", name: "Strand 2.0: Algebra", description: "Forming & simplifying algebraic expressions, solving linear equations in 1 unknown, simple & compound linear inequalities on number lines." },
      { id: "g7-math-measurements", name: "Strand 3.0: Measurements", description: "Pythagorean relationship (a²+b²=c²), length & circumference (Pi), area of plane figures & circles, volume & capacity, speed/time/distance, temperature (°C to K), money, discounts, commission & mobile money." },
      { id: "g7-math-geometry", name: "Strand 4.0: Geometry", description: "Angles on straight lines, at a point, transversals, parallelograms, polygon angles up to hexagon; geometrical constructions using ruler and compasses." },
      { id: "g7-math-data", name: "Strand 5.0: Data Handling & Probability", description: "Data collection, frequency distribution tables, pictographs, bar graphs, pie charts, line graphs, and travel graphs." }
    ]
  },
  {
    id: "g7-english",
    name: "English",
    description: "KICD Grade 7 English: Listening & speaking, intensive/extensive reading, grammar in use, and creative writing.",
    iconName: "BookOpen",
    grade: 7,
    topics: [
      { id: "g7-eng-listening-speaking", name: "Listening and Speaking", description: "Polite expressions in self-introductions, oral narrative performance techniques, selective listening, pronunciation & stress, and speech delivery." },
      { id: "g7-eng-reading-literature", name: "Reading & Literary Appreciation", description: "Independent reading, trickster & dilemma narratives, poetry analysis & stanzas, class readers, lullabies, praise songs, and non-fiction materials." },
      { id: "g7-eng-grammar", name: "Grammar in Use", description: "Nouns (common, proper, concrete, abstract, count, non-count), verb tenses, adverbs of time/place/manner, pronouns, comparative/superlative adjectives, prepositions, conjunctions, determiners, phrasal verbs, and subject-verb agreement." },
      { id: "g7-eng-writing", name: "Writing Skills", description: "Legibility & neatness, narrative paragraphing, the writing process (prewriting to publishing), friendly letters, commonly misspelt words, dialogues, descriptive writing, shopping lists, and notices/posters." }
    ]
  },
  {
    id: "g7-kiswahili",
    name: "Kiswahili",
    description: "KICD Gredi ya 7 Kiswahili: Kusikiliza na kuzungumza, kusoma na fasihi, sarufi na upatanisho wa ngeli, na kuandika.",
    iconName: "Languages",
    grade: 7,
    topics: [
      { id: "g7-kis-kusikiliza-kuzungumza", name: "Kusikiliza na Kuzungumza", description: "Mazungumzo na kujibu, sauti /dh/, /th/, /d/, /nd/, maamkuzi na maagano, hotuba ya kupasha habari, na ulinganisho wa sauti na vitendo." },
      { id: "g7-kis-kusoma-fasihi", name: "Kusoma na Fasihi", description: "Kusoma kwa ufahamu, novela (sifa, maudhui, dhamira, mandhari, ploti, wahusika, mbinu za lugha), fasihi simulizi na andishi, nyimbo za watoto, bembelezi, kazi na dini." },
      { id: "g7-kis-sarufi", name: "Sarufi na Ngeli", description: "Aina za nomino (pekee, kawaida, makundi, dhahania, wingi, vitenzi-jina, ukubwa), upatanisho wa ngeli (A-WA, U-I, KI-VI, LI-YA), nyakati na hali, vitenzi vikuu/visaidizi/vishirikishi, mnyambuliko, ukanushaji, na usemi halisi/taarifa." },
      { id: "g7-kis-kuandika", name: "Kuandika", description: "Viakifishi, barua ya kirafiki ya mwaliko, barua rasmi ya msamaha, insha za kubuni/masimulizi/picha, insha za maelekezo/maelezo, baruapepe za kidijitali, na ufupisho." }
    ]
  },
  {
    id: "g7-science",
    name: "Integrated Science",
    description: "KICD Grade 7 Integrated Science: Separation of mixtures, human respiratory system, acids, bases and indicators.",
    iconName: "FlaskConical",
    grade: 7,
    topics: [
      { id: "g7-sci-separation-mixtures", name: "Separation of Mixtures", description: "Filtration, evaporation, simple distillation, winnowing, sieving, and paper chromatography methods." },
      { id: "g7-sci-respiratory-system", name: "Human Respiratory System", description: "Lungs anatomy, inhalation/exhalation mechanics, alveoli gas exchange, and respiratory health care." },
      { id: "g7-sci-acids-bases", name: "Acids, Bases & Indicators", description: "Testing household acids and bases using natural and litmus paper indicators, neutralization reactions." }
    ]
  },
  {
    id: "g7-pretech",
    name: "Pre-Technical Studies",
    description: "KICD Grade 7 Pre-Technical Studies: Safety, computer concepts, drawing, materials, tools, and entrepreneurship.",
    iconName: "Cpu",
    grade: 7,
    topics: [
      { id: "g7-tech-foundations", name: "Strand 1.0: Foundations of Pre-Technical Studies", description: "Components of Pre-Technical Studies, physical & online work safety, workshop attires, data vs information, computer characteristics & classification." },
      { id: "g7-tech-communication", name: "Strand 2.0: Communication", description: "ICT tools in communication, artistic vs technical drawing, printing numbers/letters, line types, drawing symbols & plane geometry dimensioning." },
      { id: "g7-tech-materials", name: "Strand 3.0: Materials for Production", description: "Economic resources mapping & sustainability, metallic materials (steel, aluminum, copper) properties, non-metallic materials (wood, plastics, ceramics, stone)." },
      { id: "g7-tech-tools", name: "Strand 4.0: Tools and Production", description: "Measuring & marking out tools identification, selection, care & maintenance; goods vs services; factors of production & ethical practices." },
      { id: "g7-tech-entrepreneurship", name: "Strand 5.0: Entrepreneurship & Money", description: "Qualities of an entrepreneur, sources of business ideas, security features of Kenyan currency, themes & symbols on currency notes, SMART financial goals." }
    ]
  },
  {
    id: "g7-social",
    name: "Social Studies",
    description: "KICD Grade 7 Social Studies: Personal development, human origin, early civilisations, maps, climate, field work, and governance.",
    iconName: "Compass",
    grade: 7,
    topics: [
      { id: "g7-soc-personal-dev", name: "Strand 1.0: Social Studies & Personal Development", description: "Self-exploration, emotion management (happiness, love, fear, anger), and social entrepreneurial career opportunities." },
      { id: "g7-soc-people-relationships", name: "Strand 2.0: People and Relationships", description: "Traditional & religious human origin stories, Ancient Kingdoms (Egypt, Great Zimbabwe, Kongo), Indian Ocean slave trade & servitude, barter to currency trade, human diversity, peaceful coexistence." },
      { id: "g7-soc-csl", name: "Strand 3.0: Community Service Learning (CSL)", description: "CSL project milestones: problem identification, solution design, project planning, community implementation, and reflection." },
      { id: "g7-soc-environment", name: "Strand 4.0: Natural & Historic Built Environments", description: "Primary/secondary historical sources, early agriculture in Rift Valley & Nile Valley, map work & calculating time with longitudes, Earth & solar system theories, weather instruments & station siting, fieldwork methods & road safety data analysis." },
      { id: "g7-soc-governance", name: "Strand 5.0: Political Development & Governance", description: "Scramble for Africa & Berlin Conference terms, political organization of Ogiek/Zulu/Asante, Constitution of Kenya & national values, classification of human rights, African Diasporas, global citizenship." }
    ]
  },
  {
    id: "g7-religion",
    name: "Religious Education",
    description: "KICD Grade 7 Christian Religious Education (CRE): Creation, Bible divisions, leadership of Moses, early life of Jesus, Church and Christian living.",
    iconName: "Heart",
    grade: 7,
    topics: [
      { id: "g7-rel-foundations-creation", name: "Strands 1.0 & 2.0: CRE & Creation", description: "Importance of CRE in moral living; Biblical 1st and 2nd creation accounts; attributes of God; stewardship over animals, fish, birds, plants & natural resources." },
      { id: "g7-rel-bible-leadership", name: "Strand 3.0: The Bible & Moses", description: "Functions of the Bible in holistic growth; Old and New Testament divisions; Bible translations into Kenyan local languages; leadership of Moses during the Exodus." },
      { id: "g7-rel-early-jesus", name: "Strand 4.0: Early Life of Jesus Christ", description: "Messianic prophecies & fulfillment; John the Baptist precursor; Annunciation, birth, dedication of Jesus & interaction with Temple elders." },
      { id: "g7-rel-church-living", name: "Strands 5.0 & 6.0: The Church & Christian Living Today", description: "Forms of worship, prayer & fasting; Church contributions to healthcare & education; human sexuality & chastity; Christian family values; drug abuse prevention, overcoming gambling & responsible social media use." }
    ]
  },
  {
    id: "g7-arts",
    name: "Creative Arts and Sports",
    description: "KICD Grade 7 Creative Arts and Sports: Visual arts, music, dance, drama, film, athletics, football, handball, folk songs, storytelling, and swimming.",
    iconName: "Palette",
    grade: 7,
    topics: [
      { id: "g7-art-foundations", name: "Strand 1.0: Foundations of Creative Arts and Sports", description: "Categories of Creative Arts & Sports (Visual Arts, Music/Dance, Drama/Film, Sports); Visual arts elements (color, tone, balance), story elements, physical fitness (coordination & strength), music rhythm & treble staff pitch." },
      { id: "g7-art-creating-performing", name: "Strand 2.0: Creating & Performing", description: "Composing 4-bar rhythms with French rhythm names; Javelin carving & 5 throwing phases; 4-bar melodies in C major & window melody cards; Handball goal net macrame weaving & game passes/jump shot; Descant recorder posture, fingering & stencil printing; Football perspective painting & trapping/dribbling; Storytelling & flipbook animation; Kenyan folk songs classification & block printing costumes; Backstroke & pencil dive swimming." },
      { id: "g7-art-appreciation", name: "Strand 3.0: Appreciation in Creative Arts and Sports", description: "Evaluating criteria for football, folksongs, storytelling, and 2D visual artworks (balance, proportion, dominance, theme)." }
    ]
  },
  {
    id: "g7-agriculture",
    name: "Agriculture and Nutrition",
    description: "KICD Grade 7 Agriculture and Nutrition: Conservation of resources, food production, animal hygiene, sewing/knitting, suspended gardens, value addition, soap making.",
    iconName: "Sprout",
    grade: 7,
    topics: [
      { id: "g7-agr-conservation", name: "Strand 1.0: Conservation of Resources", description: "Controlling soil pollution (waste water, artificial fertilizers, plastics); constructing water retention ditches & pits; conserving vitamins & mineral salts in vegetables; growing trees for climate conservation." },
      { id: "g7-agr-production", name: "Strand 2.0: Food Production Processes", description: "Soil tilth selection for planting materials; crop management (gapping, thinning, weeding, earthing-up); preparing eggs (sorting, grading) & honey (straining); cooking by grilling, roasting, and steaming." },
      { id: "g7-agr-hygiene", name: "Strand 3.0: Hygiene Practices", description: "Hygiene in rearing domestic animals (clean feeders, waterers, well-ventilated housing); laundering loose coloured items (kneading, squeezing, drying, finishing)." },
      { id: "g7-agr-techniques", name: "Strand 4.0: Production Techniques", description: "Sewing skills: Knitting household articles with purl and knit stitches; constructing framed suspended gardens; value addition to crops (potatoes, cassava, sweet potatoes) by drying/frying; making homemade soap using natural ingredients (ashes, salt, water, oils)." }
    ]
  },

  // ==================== GRADE 8 ====================
  {
    id: "g8-math",
    name: "Mathematics",
    description: "Grade 8 junior secondary math: Solve linear equations, percentages, and interest rate word problems.",
    iconName: "Calculator",
    grade: 8,
    topics: [
      { id: "g8-math-equations", name: "Solving Linear Equations", description: "Master variables on both sides of equal signs and graph standard straight-line slopes." },
      { id: "g8-math-ratios", name: "Simple Interest and Profit Ratios", description: "Grasp financial mathematics including simple interest rates and depreciation cycles." }
    ]
  },
  {
    id: "g8-english",
    name: "English",
    description: "Grade 8 literary techniques: Identifying metaphors, personification, and descriptive essay outlines.",
    iconName: "BookOpen",
    grade: 8,
    topics: [
      { id: "g8-eng-devices", name: "Advanced Literary Devices", description: "Analyze personification, hyperbole, and idioms in prose works." },
      { id: "g8-eng-essays", name: "Descriptive Essay Compositions", description: "Learn to write paragraphs that describe sensory experiences in detail." }
    ]
  },
  {
    id: "g8-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 8: Ngeli za U-I na KI-VI, uandishi wa barua ya kiofisi na utafiti wa methali.",
    iconName: "Languages",
    grade: 8,
    topics: [
      { id: "g8-kis-sarufi", name: "Upatanisho wa Ngeli za U-I", description: "Kujifunza upatanishi dhabiti wa kisarufi kwa nomino kama Mti-Miti na Ukuta-Kuta." },
      { id: "g8-kis-barua-rasmi", name: "Barua Rasmi na Ripoti Rahisi", description: "Kukuza stadi za uandishi wa ripoti za kiofisi na barua kwa mhariri." }
    ]
  },
  {
    id: "g8-science",
    name: "Integrated Science",
    description: "Grade 8 chemistry & biology: Plant photosynthesis and chemical reactions.",
    iconName: "FlaskConical",
    grade: 8,
    topics: [
      { id: "g8-sci-photosynthesis", name: "Photosynthesis & Leaf Stomata", description: "Investigate carbon dioxide assimilation, chlorophyll light harvesting, and sugar creation." },
      { id: "g8-sci-chemical", name: "Introduction to Chemical Reactions", description: "Observe physical changes vs chemical bond breakages when fuels burn." }
    ]
  },
  {
    id: "g8-pretech",
    name: "Pre-Technical Studies",
    description: "Grade 8 technical: Hand tools processing, technical metals, wood and plastic processing.",
    iconName: "Cpu",
    grade: 8,
    topics: [
      { id: "g8-tech-materials", name: "Common Hand Tools & Materials", description: "Study properties and processing of metals, wood, and plastics using measuring and cutting hand tools." }
    ]
  },
  {
    id: "g8-social",
    name: "Social Studies",
    description: "Grade 8 history: Ancient kingdoms, Trans-Saharan trade routes, and early civilizations.",
    iconName: "Compass",
    grade: 8,
    topics: [
      { id: "g8-soc-kingdoms", name: "Ancient African Kingdoms & Trade", description: "Investigate early civilisations, including the Mali and Songhai Empires, and Trans-Saharan trade routes." }
    ]
  },
  {
    id: "g8-religion",
    name: "Religious Education",
    description: "Grade 8 values: Peer pressure management, empathy, and making moral decisions.",
    iconName: "Heart",
    grade: 8,
    topics: [
      { id: "g8-rel-moral-values", name: "Values & Moral Decision Making", description: "Analyze core values like empathy, honesty, and integrity in guiding daily relationships and peer interactions." }
    ]
  },
  {
    id: "g8-arts",
    name: "Creative Arts",
    description: "Grade 8 music & dance: reading time signatures, pitch lines, and rhythm drumming.",
    iconName: "Palette",
    grade: 8,
    topics: [
      { id: "g8-art-rhythm-music", name: "Rhythm, Melody & Music Notation", description: "Identify pitch on staves, read time signatures, and explore traditional folk songs and percussion." }
    ]
  },
  {
    id: "g8-agriculture",
    name: "Agriculture",
    description: "Grade 8 farming: establishing crop nurseries, seedbed sowing, and vegetable pest control.",
    iconName: "Sprout",
    grade: 8,
    topics: [
      { id: "g8-agr-crop-husbandry", name: "Nursery Management & Vegetable Production", description: "Sow crop seeds in protective nurseries, master transplantation techniques, and defend against crop pests." }
    ]
  },

  // ==================== GRADE 9 ====================
  {
    id: "g9-math",
    name: "Mathematics",
    description: "Grade 9 geometry: Master the Pythagorean Theorem, coordinate graphs, and trigonometry basics.",
    iconName: "Calculator",
    grade: 9,
    topics: [
      { id: "g9-math-pythagorean-theorem", name: "The Pythagorean Theorem", description: "Investigate right-angled triangles and discover the fundamental geometric relationship of hypotenusal lengths." },
      { id: "g9-math-coordinates", name: "Trigonometric Ratios (Sine, Cosine)", description: "Learn fundamentals of sine, cosine, and tangent calculations inside standard geometric vectors." }
    ]
  },
  {
    id: "g9-english",
    name: "English",
    description: "Grade 9 English: Narrative composition formatting, character development arcs, and literary analysis.",
    iconName: "BookOpen",
    grade: 9,
    topics: [
      { id: "g9-eng-narrative-compositions", name: "Creative Narrative Compositions", description: "Draft engaging stories using structured outlines, descriptive adjectives, and well-developed character arcs." },
      { id: "g9-eng-literary-critique", name: "Theme Analysis & Critique", description: "Analyze underlying motifs, central themes, and moral messages in comprehensive classic stories." }
    ]
  },
  {
    id: "g9-kiswahili",
    name: "Kiswahili",
    description: "Kiswahili ya Gredi ya 9: Insha za hoja na maelezo, ngeli ya LI-YA, na uchambuzi wa riwaya fupi.",
    iconName: "Languages",
    grade: 9,
    topics: [
      { id: "g9-kis-uandishi-insha", name: "Uandishi wa Insha za Hoja na Maelezo", description: "Kukuza stadi za uandishi wa barua za kiofisi na insha za maelezo, hoja, na masimulizi." },
      { id: "g9-kis-uchambuzi", name: "Uchambuzi wa Fasihi na Riwaya", description: "Kuchambua hadithi, wahusika, ploti, na mafunzo mbalimbali ya maadili katika riwaya." }
    ]
  },
  {
    id: "g9-science",
    name: "Integrated Science",
    description: "Grade 9 Integrated Science: acidity and base properties, litmus indicator tests, and simple chemical formulas.",
    iconName: "FlaskConical",
    grade: 9,
    topics: [
      { id: "g9-sci-acids-bases", name: "Acids, Bases & Indicators", description: "Identify chemical properties of acidic and basic materials, using natural and commercial indicators." },
      { id: "g9-sci-elements", name: "Elements, Compounds & Formulae", description: "Investigate atoms, common molecules, chemical signs, and simple balanced formula equations." }
    ]
  },
  {
    id: "g9-pretech",
    name: "Pre-Technical Studies",
    description: "Grade 9 technical: geometric construction, drafting dimension lines, and orthographic projections.",
    iconName: "Cpu",
    grade: 9,
    topics: [
      { id: "g9-tech-technical-drawing", name: "Introduction to Technical Drawing", description: "Learn essential geometric construction, dimensioning guidelines, and first-angle orthographic projections." }
    ]
  },
  {
    id: "g9-social",
    name: "Social Studies",
    description: "Grade 9 social studies: constitutional rights, citizenship, national unity and national integration.",
    iconName: "Compass",
    grade: 9,
    topics: [
      { id: "g9-soc-citizenship-values", name: "Citizenship & National Cohesion", description: "Review constitutional rights, values of national integration, and duties of responsible citizens." }
    ]
  },
  {
    id: "g9-religion",
    name: "Religious Education",
    description: "Grade 9 values: Social justice, volunteering, resource sharing, and community leadership.",
    iconName: "Heart",
    grade: 9,
    topics: [
      { id: "g9-rel-community-service", name: "Social Justice & Community Service", description: "Understand how volunteering, civic leadership, and fair resource sharing strengthen societal bonds." }
    ]
  },
  {
    id: "g9-arts",
    name: "Creative Arts",
    description: "Grade 9 performing arts: puppet designs, hand puppets, and theatrical dramatic scripts.",
    iconName: "Palette",
    grade: 9,
    topics: [
      { id: "g9-art-puppetry-theatre", name: "Puppetry & Theatre Production", description: "Design simple hand-made puppets and write short dramatic performance scripts conveying social messages." }
    ]
  },
  {
    id: "g9-agriculture",
    name: "Agriculture",
    description: "Grade 9 agriculture: domestic feed classification, roughages and concentrates, and animal balanced diet diets.",
    iconName: "Sprout",
    grade: 9,
    topics: [
      { id: "g9-agr-animal-nutrition", name: "Livestock Feeds & Domestic Feeding Practice", description: "Classify animal feeds into roughages and concentrates, and balance diets for domestic farm animals." }
    ]
  }
];
