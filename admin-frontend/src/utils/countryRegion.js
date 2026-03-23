function getCountryRegion(phone){

    /* ---------------- EXCLUDED COUNTRIES ---------------- */
    
    const excluded = [
    "+850","+98","+95","+1", // APAC exclusions
    "+375","+236","+243","+964","+961","+231","+218","+7","+252","+249","+963","+967","+263", // EMEA exclusions
    "+53","+505","+58" // LATAM exclusions
    ]
    
    for(const code of excluded){
    if(phone.startsWith(code)){
    return {country:"Excluded",region:"OTHER"}
    }
    }
    
    /* ---------------- APAC ---------------- */
    
    const APAC = {
    "+93":"Afghanistan",
    "+1684":"American Samoa",
    "+61":"Australia",
    "+880":"Bangladesh",
    "+975":"Bhutan",
    "+673":"Brunei",
    "+855":"Cambodia",
    "+86":"China",
    "+682":"Cook Islands",
    "+670":"East Timor",
    "+679":"Fiji",
    "+689":"French Polynesia",
    "+1671":"Guam",
    "+852":"Hong Kong",
    "+91":"India",
    "+62":"Indonesia",
    "+81":"Japan",
    "+686":"Kiribati",
    "+856":"Laos",
    "+853":"Macau",
    "+60":"Malaysia",
    "+960":"Maldives",
    "+692":"Marshall Islands",
    "+691":"Micronesia",
    "+976":"Mongolia",
    "+674":"Nauru",
    "+977":"Nepal",
    "+687":"New Caledonia",
    "+64":"New Zealand",
    "+683":"Niue",
    "+1670":"Northern Mariana Islands",
    "+92":"Pakistan",
    "+680":"Palau",
    "+675":"Papua New Guinea",
    "+63":"Philippines",
    "+685":"Samoa",
    "+65":"Singapore",
    "+677":"Solomon Islands",
    "+82":"South Korea",
    "+94":"Sri Lanka",
    "+886":"Taiwan",
    "+66":"Thailand",
    "+676":"Tonga",
    "+688":"Tuvalu",
    "+678":"Vanuatu",
    "+84":"Vietnam"
    }
    
    /* ---------------- EMEA ---------------- */
    
    const EMEA = {
    "+355":"Albania",
    "+213":"Algeria",
    "+376":"Andorra",
    "+244":"Angola",
    "+43":"Austria",
    "+994":"Azerbaijan",
    "+973":"Bahrain",
    "+32":"Belgium",
    "+229":"Benin",
    "+387":"Bosnia and Herzegovina",
    "+267":"Botswana",
    "+359":"Bulgaria",
    "+226":"Burkina Faso",
    "+257":"Burundi",
    "+238":"Cabo Verde",
    "+237":"Cameroon",
    "+235":"Chad",
    "+269":"Comoros",
    "+242":"Congo",
    "+225":"Côte d'Ivoire",
    "+385":"Croatia",
    "+357":"Cyprus",
    "+420":"Czech Republic",
    "+45":"Denmark",
    "+253":"Djibouti",
    "+20":"Egypt",
    "+240":"Equatorial Guinea",
    "+291":"Eritrea",
    "+372":"Estonia",
    "+268":"Eswatini",
    "+251":"Ethiopia",
    "+358":"Finland",
    "+33":"France",
    "+241":"Gabon",
    "+220":"Gambia",
    "+995":"Georgia",
    "+49":"Germany",
    "+233":"Ghana",
    "+30":"Greece",
    "+224":"Guinea",
    "+245":"Guinea-Bissau",
    "+36":"Hungary",
    "+354":"Iceland",
    "+353":"Ireland",
    "+972":"Israel",
    "+39":"Italy",
    "+962":"Jordan",
    "+7":"Kazakhstan",
    "+254":"Kenya",
    "+383":"Kosovo",
    "+965":"Kuwait",
    "+996":"Kyrgyzstan",
    "+371":"Latvia",
    "+266":"Lesotho",
    "+423":"Liechtenstein",
    "+370":"Lithuania",
    "+352":"Luxembourg",
    "+261":"Madagascar",
    "+265":"Malawi",
    "+223":"Mali",
    "+356":"Malta",
    "+222":"Mauritania",
    "+230":"Mauritius",
    "+373":"Moldova",
    "+377":"Monaco",
    "+382":"Montenegro",
    "+212":"Morocco",
    "+258":"Mozambique",
    "+264":"Namibia",
    "+31":"Netherlands",
    "+227":"Niger",
    "+234":"Nigeria",
    "+389":"North Macedonia",
    "+47":"Norway",
    "+968":"Oman",
    "+970":"Palestine",
    "+48":"Poland",
    "+351":"Portugal",
    "+974":"Qatar",
    "+40":"Romania",
    "+250":"Rwanda",
    "+378":"San Marino",
    "+239":"Sao Tome and Principe",
    "+966":"Saudi Arabia",
    "+221":"Senegal",
    "+381":"Serbia",
    "+248":"Seychelles",
    "+232":"Sierra Leone",
    "+421":"Slovakia",
    "+386":"Slovenia",
    "+27":"South Africa",
    "+211":"South Sudan",
    "+34":"Spain",
    "+46":"Sweden",
    "+41":"Switzerland",
    "+992":"Tajikistan",
    "+255":"Tanzania",
    "+228":"Togo",
    "+216":"Tunisia",
    "+90":"Turkey",
    "+993":"Turkmenistan",
    "+256":"Uganda",
    "+380":"Ukraine",
    "+971":"United Arab Emirates",
    "+44":"United Kingdom",
    "+998":"Uzbekistan",
    "+379":"Vatican City",
    "+260":"Zambia"
    }
    
    /* ---------------- LATAM ---------------- */
    
    const LATAM = {
    "+1268":"Antigua and Barbuda",
    "+54":"Argentina",
    "+1242":"Bahamas",
    "+1246":"Barbados",
    "+501":"Belize",
    "+591":"Bolivia",
    "+55":"Brazil",
    "+56":"Chile",
    "+57":"Colombia",
    "+506":"Costa Rica",
    "+1767":"Dominica",
    "+1809":"Dominican Republic",
    "+593":"Ecuador",
    "+503":"El Salvador",
    "+1473":"Grenada",
    "+502":"Guatemala",
    "+592":"Guyana",
    "+509":"Haiti",
    "+504":"Honduras",
    "+1876":"Jamaica",
    "+52":"Mexico",
    "+507":"Panama",
    "+595":"Paraguay",
    "+51":"Peru",
    "+1869":"Saint Kitts and Nevis",
    "+1758":"Saint Lucia",
    "+1784":"Saint Vincent and the Grenadines",
    "+597":"Suriname",
    "+1868":"Trinidad and Tobago",
    "+598":"Uruguay"
    }
    
    /* ---------------- CHECK REGIONS ---------------- */
    
    for(const code in APAC){
    if(phone.startsWith(code)){
    return {country:APAC[code],region:"APAC"}
    }
    }
    
    for(const code in EMEA){
    if(phone.startsWith(code)){
    return {country:EMEA[code],region:"EMEA"}
    }
    }
    
    for(const code in LATAM){
    if(phone.startsWith(code)){
    return {country:LATAM[code],region:"LATAM"}
    }
    }
    
    /* ---------------- OTHER ---------------- */
    
    return {country:"Other",region:"OTHER"}
    
    }
    
    module.exports = getCountryRegion