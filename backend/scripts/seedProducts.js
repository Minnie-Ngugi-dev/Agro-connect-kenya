import 'dotenv/config';
import mongoose from 'mongoose';
import User    from '../models/User.js';
import Product from '../models/Product.js';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agro-connect';
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const TOWNS = { Nakuru:['Naivasha','Gilgil','Molo','Rongai'], Kisumu:['Milimani','Kondele','Mamboleo'], Kiambu:['Limuru','Ruiru','Kikuyu'], Machakos:['Athi River','Kangundo'], Meru:['Nkubu','Timau','Laare'], Nairobi:['Westlands','Karen','Kasarani'] };

const PRODUCTS = {
  Vegetables:[
    {name:'Roma Tomatoes',price:80,unit:'kg',qty:500,tags:['fresh','organic']},
    {name:'Kale (Sukuma Wiki)',price:30,unit:'bunches',qty:300,tags:['fresh']},
    {name:'Spinach',price:40,unit:'bunches',qty:200,tags:['fresh','leafy']},
    {name:'Cabbage',price:60,unit:'kg',qty:400,tags:['fresh']},
    {name:'Carrots',price:70,unit:'kg',qty:350,tags:['fresh','root']},
    {name:'Red Onions',price:90,unit:'kg',qty:600,tags:['fresh']},
    {name:'White Onions',price:85,unit:'kg',qty:400,tags:['fresh']},
    {name:'Garlic',price:400,unit:'kg',qty:100,tags:['spice']},
    {name:'Ginger',price:350,unit:'kg',qty:80,tags:['spice','fresh']},
    {name:'Green Pepper',price:150,unit:'kg',qty:200,tags:['fresh']},
    {name:'Red Pepper',price:180,unit:'kg',qty:180,tags:['fresh']},
    {name:'Cucumber',price:60,unit:'kg',qty:300,tags:['fresh']},
    {name:'Zucchini',price:120,unit:'kg',qty:150,tags:['fresh']},
    {name:'Broccoli',price:200,unit:'kg',qty:100,tags:['fresh','organic']},
    {name:'Cauliflower',price:180,unit:'kg',qty:120,tags:['fresh']},
    {name:'Beetroot',price:90,unit:'kg',qty:250,tags:['fresh','root']},
    {name:'Celery',price:150,unit:'bunches',qty:100,tags:['fresh']},
    {name:'Leeks',price:120,unit:'bunches',qty:150,tags:['fresh']},
    {name:'Spring Onions',price:50,unit:'bunches',qty:300,tags:['fresh']},
    {name:'Hot Chillies',price:200,unit:'kg',qty:150,tags:['spice','fresh']},
    {name:'Eggplant',price:100,unit:'kg',qty:200,tags:['fresh']},
    {name:'Pumpkin',price:50,unit:'kg',qty:400,tags:['fresh']},
    {name:'Butternut Squash',price:80,unit:'kg',qty:300,tags:['fresh']},
    {name:'Green Beans',price:120,unit:'kg',qty:250,tags:['fresh']},
    {name:'Baby Marrow',price:130,unit:'kg',qty:200,tags:['fresh']},
    {name:'Managu (Nightshade)',price:45,unit:'bunches',qty:200,tags:['indigenous']},
    {name:'Terere (Amaranth)',price:40,unit:'bunches',qty:250,tags:['indigenous']},
    {name:'Kunde (Cowpea Leaves)',price:35,unit:'bunches',qty:220,tags:['indigenous']},
    {name:'Dhania (Coriander)',price:30,unit:'bunches',qty:300,tags:['herb']},
    {name:'Arrowroot Leaves',price:40,unit:'bunches',qty:180,tags:['fresh','local']},
  ],
  Fruits:[
    {name:'Mangoes (Tommy Atkins)',price:100,unit:'kg',qty:400,tags:['sweet','tropical']},
    {name:'Mangoes (Apple)',price:120,unit:'kg',qty:350,tags:['sweet','local']},
    {name:'Avocados (Hass)',price:150,unit:'kg',qty:300,tags:['creamy']},
    {name:'Avocados (Fuerte)',price:130,unit:'kg',qty:280,tags:['creamy']},
    {name:'Bananas (Cavendish)',price:80,unit:'bunches',qty:400,tags:['sweet']},
    {name:'Bananas (Mshare)',price:60,unit:'bunches',qty:350,tags:['local']},
    {name:'Pineapples',price:150,unit:'pieces',qty:200,tags:['tropical']},
    {name:'Watermelons',price:200,unit:'pieces',qty:150,tags:['fresh']},
    {name:'Passion Fruits',price:200,unit:'kg',qty:250,tags:['tropical']},
    {name:'Papayas',price:100,unit:'pieces',qty:200,tags:['tropical']},
    {name:'Guavas',price:80,unit:'kg',qty:300,tags:['tropical']},
    {name:'Oranges',price:90,unit:'kg',qty:400,tags:['citrus']},
    {name:'Tangerines',price:100,unit:'kg',qty:300,tags:['citrus']},
    {name:'Lemons',price:150,unit:'kg',qty:200,tags:['citrus']},
    {name:'Limes',price:200,unit:'kg',qty:150,tags:['citrus']},
    {name:'Strawberries',price:500,unit:'kg',qty:100,tags:['berry']},
    {name:'Tree Tomatoes',price:120,unit:'kg',qty:200,tags:['local']},
    {name:'Jackfruit',price:300,unit:'pieces',qty:80,tags:['tropical']},
    {name:'Plums',price:300,unit:'kg',qty:120,tags:['stone fruit']},
    {name:'Peaches',price:350,unit:'kg',qty:100,tags:['stone fruit']},
    {name:'Grapes',price:600,unit:'kg',qty:80,tags:['berry']},
    {name:'Dragon Fruit',price:500,unit:'kg',qty:70,tags:['exotic']},
    {name:'Soursop',price:300,unit:'pieces',qty:90,tags:['tropical']},
    {name:'Tamarinds',price:200,unit:'kg',qty:150,tags:['sour']},
    {name:'Fresh Coconuts',price:80,unit:'pieces',qty:300,tags:['tropical']},
    {name:'Cape Gooseberries',price:350,unit:'kg',qty:100,tags:['berry']},
    {name:'Custard Apples',price:250,unit:'kg',qty:100,tags:['tropical']},
    {name:'Mulberries',price:400,unit:'kg',qty:80,tags:['berry']},
    {name:'Blueberries',price:800,unit:'kg',qty:60,tags:['berry','organic']},
    {name:'Kiwi Fruits',price:700,unit:'kg',qty:60,tags:['exotic']},
  ],
  Cereals:[
    {name:'Dry Maize',price:45,unit:'kg',qty:2000,tags:['staple']},
    {name:'Maize Flour (Unga)',price:55,unit:'kg',qty:1500,tags:['staple']},
    {name:'White Rice',price:120,unit:'kg',qty:1000,tags:['staple']},
    {name:'Brown Rice',price:140,unit:'kg',qty:600,tags:['healthy']},
    {name:'Wheat Grain',price:60,unit:'kg',qty:1500,tags:['grain']},
    {name:'Wheat Flour',price:70,unit:'kg',qty:1200,tags:['baking']},
    {name:'Sorghum',price:50,unit:'kg',qty:800,tags:['local']},
    {name:'Finger Millet (Wimbi)',price:80,unit:'kg',qty:600,tags:['local','healthy']},
    {name:'Rolled Oats',price:150,unit:'kg',qty:400,tags:['healthy']},
    {name:'Barley',price:90,unit:'kg',qty:500,tags:['grain']},
    {name:'Pearl Millet',price:70,unit:'kg',qty:500,tags:['local']},
    {name:'Teff',price:200,unit:'kg',qty:200,tags:['superfood']},
    {name:'Amaranth Grain',price:180,unit:'kg',qty:250,tags:['superfood']},
    {name:'Quinoa',price:600,unit:'kg',qty:100,tags:['superfood']},
    {name:'Popcorn Maize',price:70,unit:'kg',qty:400,tags:['snack']},
    {name:'Sweet Corn (Dry)',price:80,unit:'kg',qty:350,tags:['sweet']},
    {name:'Cassava Flour',price:60,unit:'kg',qty:800,tags:['gluten free']},
    {name:'Semolina',price:100,unit:'kg',qty:400,tags:['pasta']},
    {name:'Yellow Maize',price:42,unit:'kg',qty:2000,tags:['feed']},
    {name:'Rye',price:110,unit:'kg',qty:200,tags:['grain']},
    {name:'Buckwheat',price:250,unit:'kg',qty:150,tags:['gluten free']},
    {name:'Millet Flour',price:90,unit:'kg',qty:400,tags:['local']},
    {name:'Sorghum Flour',price:65,unit:'kg',qty:500,tags:['local']},
    {name:'Posho (Ugali Flour)',price:48,unit:'kg',qty:2000,tags:['staple']},
    {name:'Broken Rice',price:80,unit:'kg',qty:800,tags:['economy']},
    {name:'Maize Germ',price:40,unit:'kg',qty:600,tags:['by-product']},
    {name:'Maize Bran',price:30,unit:'kg',qty:800,tags:['feed']},
    {name:'Rice Bran',price:35,unit:'kg',qty:600,tags:['feed']},
    {name:'Corn Starch',price:120,unit:'kg',qty:300,tags:['thickener']},
    {name:'Wild Rice',price:400,unit:'kg',qty:100,tags:['premium']},
  ],
  Legumes:[
    {name:'Red Kidney Beans',price:130,unit:'kg',qty:500,tags:['protein']},
    {name:'White Kidney Beans',price:120,unit:'kg',qty:450,tags:['protein']},
    {name:'Black Beans',price:140,unit:'kg',qty:350,tags:['protein']},
    {name:'Chickpeas (Dengu)',price:150,unit:'kg',qty:400,tags:['protein','local']},
    {name:'Green Grams (Mung)',price:140,unit:'kg',qty:450,tags:['protein','local']},
    {name:'Red Lentils',price:160,unit:'kg',qty:350,tags:['protein']},
    {name:'Green Lentils',price:170,unit:'kg',qty:300,tags:['protein']},
    {name:'Pigeon Peas (Mbaazi)',price:110,unit:'kg',qty:500,tags:['local','coastal']},
    {name:'Cowpeas (Kunde)',price:100,unit:'kg',qty:550,tags:['local']},
    {name:'Field Peas',price:120,unit:'kg',qty:400,tags:['protein']},
    {name:'Black-Eyed Peas',price:115,unit:'kg',qty:450,tags:['protein','local']},
    {name:'Soybeans',price:90,unit:'kg',qty:800,tags:['protein']},
    {name:'Groundnuts (Peanuts)',price:200,unit:'kg',qty:400,tags:['oil','snack']},
    {name:'Roasted Groundnuts',price:250,unit:'kg',qty:250,tags:['snack']},
    {name:'Groundnut Flour',price:280,unit:'kg',qty:200,tags:['processed']},
    {name:'Split Yellow Peas',price:130,unit:'kg',qty:350,tags:['protein']},
    {name:'Lima Beans',price:140,unit:'kg',qty:300,tags:['protein']},
    {name:'Adzuki Beans',price:200,unit:'kg',qty:200,tags:['protein']},
    {name:'Navy Beans',price:130,unit:'kg',qty:350,tags:['protein']},
    {name:'Pinto Beans',price:135,unit:'kg',qty:300,tags:['protein']},
    {name:'Fava Beans',price:120,unit:'kg',qty:350,tags:['protein','local']},
    {name:'Bambara Groundnuts',price:160,unit:'kg',qty:250,tags:['local','protein']},
    {name:'Moth Beans',price:110,unit:'kg',qty:300,tags:['drought resistant']},
    {name:'Winged Beans',price:180,unit:'kg',qty:200,tags:['protein']},
    {name:'Soya Chunks (TVP)',price:300,unit:'kg',qty:150,tags:['processed']},
    {name:'Bean Flour (Mixed)',price:170,unit:'kg',qty:300,tags:['flour']},
    {name:'Lentil Flour',price:180,unit:'kg',qty:250,tags:['gluten free']},
    {name:'Borlotti Beans',price:145,unit:'kg',qty:250,tags:['protein']},
    {name:'Tepary Beans',price:150,unit:'kg',qty:200,tags:['drought resistant']},
    {name:'Tofu (Fresh)',price:400,unit:'kg',qty:100,tags:['processed','protein']},
  ],
  Tubers:[
    {name:'Irish Potatoes',price:60,unit:'kg',qty:1000,tags:['staple']},
    {name:'Orange Sweet Potatoes',price:50,unit:'kg',qty:800,tags:['nutritious']},
    {name:'White Sweet Potatoes',price:45,unit:'kg',qty:700,tags:['staple','local']},
    {name:'Cassava (Muhogo)',price:40,unit:'kg',qty:900,tags:['staple','coastal']},
    {name:'Yams (Nduma)',price:80,unit:'kg',qty:500,tags:['local']},
    {name:'Arrowroots',price:70,unit:'kg',qty:400,tags:['local']},
    {name:'Cocoyam (Taro)',price:75,unit:'kg',qty:400,tags:['local']},
    {name:'Turnips',price:80,unit:'kg',qty:350,tags:['root']},
    {name:'Parsnips',price:150,unit:'kg',qty:200,tags:['root']},
    {name:'Radishes',price:100,unit:'kg',qty:250,tags:['root']},
    {name:'Certified Potato Seed',price:120,unit:'kg',qty:500,tags:['seed']},
    {name:'Purple Sweet Potatoes',price:90,unit:'kg',qty:350,tags:['nutritious']},
    {name:'Baby Potatoes',price:100,unit:'kg',qty:400,tags:['gourmet']},
    {name:'Russet Potatoes',price:75,unit:'kg',qty:600,tags:['baking']},
    {name:'Red Potatoes',price:70,unit:'kg',qty:500,tags:['waxy']},
    {name:'Yellow Potatoes',price:80,unit:'kg',qty:450,tags:['buttery']},
    {name:'Fingerling Potatoes',price:120,unit:'kg',qty:250,tags:['gourmet']},
    {name:'Water Yam',price:85,unit:'kg',qty:400,tags:['local']},
    {name:'Elephant Foot Yam',price:90,unit:'kg',qty:300,tags:['local']},
    {name:'Eddoe (Small Taro)',price:110,unit:'kg',qty:250,tags:['tropical']},
    {name:'Jerusalem Artichoke',price:200,unit:'kg',qty:150,tags:['exotic']},
    {name:'Jicama (Yam Bean)',price:200,unit:'kg',qty:150,tags:['exotic']},
    {name:'Lotus Root',price:300,unit:'kg',qty:100,tags:['exotic']},
    {name:'Burdock Root',price:220,unit:'kg',qty:100,tags:['medicinal']},
    {name:'Celeriac',price:200,unit:'kg',qty:150,tags:['root']},
    {name:'Sweet Potato Vines',price:200,unit:'bunches',qty:300,tags:['planting']},
    {name:'Cassava Cuttings',price:150,unit:'bunches',qty:200,tags:['planting']},
    {name:'Ulluco',price:270,unit:'kg',qty:80,tags:['exotic']},
    {name:'Mashua',price:180,unit:'kg',qty:120,tags:['exotic']},
    {name:'Oca (NZ Yam)',price:250,unit:'kg',qty:100,tags:['exotic']},
  ],
  Dairy:[
    {name:'Fresh Cow Milk',price:60,unit:'litres',qty:500,tags:['fresh','daily']},
    {name:'Pasteurised Milk',price:70,unit:'litres',qty:400,tags:['pasteurised']},
    {name:'UHT Whole Milk',price:80,unit:'litres',qty:300,tags:['long life']},
    {name:'Skimmed Milk',price:75,unit:'litres',qty:250,tags:['low fat']},
    {name:'Buttermilk',price:65,unit:'litres',qty:200,tags:['fermented']},
    {name:'Fresh Cream',price:350,unit:'litres',qty:100,tags:['cooking']},
    {name:'Whipping Cream',price:400,unit:'litres',qty:80,tags:['baking']},
    {name:'Plain Yoghurt',price:120,unit:'kg',qty:200,tags:['probiotic']},
    {name:'Flavoured Yoghurt',price:150,unit:'kg',qty:180,tags:['sweet']},
    {name:'Greek Yoghurt',price:250,unit:'kg',qty:120,tags:['thick','protein']},
    {name:'Salted Butter',price:1200,unit:'kg',qty:80,tags:['cooking']},
    {name:'Unsalted Butter',price:1200,unit:'kg',qty:80,tags:['baking']},
    {name:'Ghee',price:1500,unit:'kg',qty:60,tags:['cooking','premium']},
    {name:'Cheddar Cheese',price:1800,unit:'kg',qty:50,tags:['premium']},
    {name:'Mozzarella Cheese',price:2000,unit:'kg',qty:40,tags:['pizza']},
    {name:'Gouda Cheese',price:2200,unit:'kg',qty:30,tags:['premium']},
    {name:'Cottage Cheese',price:800,unit:'kg',qty:80,tags:['fresh']},
    {name:'Cream Cheese',price:1200,unit:'kg',qty:60,tags:['spread']},
    {name:'Sour Cream',price:600,unit:'kg',qty:100,tags:['fermented']},
    {name:'Kefir',price:200,unit:'litres',qty:150,tags:['probiotic']},
    {name:'Goat Milk (Fresh)',price:100,unit:'litres',qty:150,tags:['goat']},
    {name:'Camel Milk',price:200,unit:'litres',qty:60,tags:['medicinal']},
    {name:'Paneer',price:900,unit:'kg',qty:70,tags:['fresh']},
    {name:'Labneh',price:400,unit:'kg',qty:90,tags:['spread']},
    {name:'Condensed Milk',price:600,unit:'litres',qty:100,tags:['sweet']},
    {name:'Clotted Cream',price:800,unit:'kg',qty:40,tags:['premium']},
    {name:'Whey Protein (Raw)',price:500,unit:'kg',qty:80,tags:['protein']},
    {name:'Sheep Milk',price:150,unit:'litres',qty:80,tags:['alternative']},
    {name:'Quark',price:500,unit:'kg',qty:70,tags:['baking']},
    {name:'Dulce de Leche',price:700,unit:'kg',qty:50,tags:['sweet']},
  ],
  Poultry:[
    {name:'Broiler Chicken (Live)',price:600,unit:'pieces',qty:100,tags:['live']},
    {name:'Broiler Chicken (Dressed)',price:800,unit:'pieces',qty:80,tags:['dressed']},
    {name:'Kienyeji Chicken (Live)',price:900,unit:'pieces',qty:60,tags:['organic','local']},
    {name:'Kienyeji Chicken (Dressed)',price:1100,unit:'pieces',qty:50,tags:['organic']},
    {name:'Eggs (Tray of 30)',price:450,unit:'pieces',qty:200,tags:['fresh','daily']},
    {name:'Fertilised Eggs',price:600,unit:'pieces',qty:100,tags:['hatching']},
    {name:'Turkey (Live)',price:4000,unit:'pieces',qty:20,tags:['turkey']},
    {name:'Turkey (Dressed)',price:5000,unit:'pieces',qty:15,tags:['turkey']},
    {name:'Duck (Live)',price:1500,unit:'pieces',qty:30,tags:['duck']},
    {name:'Duck (Dressed)',price:1800,unit:'pieces',qty:25,tags:['duck']},
    {name:'Quail (Live)',price:300,unit:'pieces',qty:100,tags:['quail']},
    {name:'Quail Eggs (12 pack)',price:150,unit:'pieces',qty:200,tags:['quail']},
    {name:'Guinea Fowl',price:1200,unit:'pieces',qty:30,tags:['game']},
    {name:'Chicken Wings',price:400,unit:'kg',qty:150,tags:['cut']},
    {name:'Chicken Thighs',price:450,unit:'kg',qty:120,tags:['cut']},
    {name:'Chicken Breasts',price:600,unit:'kg',qty:100,tags:['cut']},
    {name:'Chicken Drumsticks',price:420,unit:'kg',qty:130,tags:['cut']},
    {name:'Chicken Gizzards',price:300,unit:'kg',qty:150,tags:['offal']},
    {name:'Chicken Livers',price:250,unit:'kg',qty:160,tags:['offal']},
    {name:'Chicken Feet',price:150,unit:'kg',qty:200,tags:['offal']},
    {name:'Chicken Necks',price:200,unit:'kg',qty:180,tags:['soup']},
    {name:'Chicken Stock Bones',price:100,unit:'kg',qty:200,tags:['stock']},
    {name:'Ostrich Meat',price:2500,unit:'kg',qty:30,tags:['exotic']},
    {name:'Ostrich Eggs',price:1500,unit:'pieces',qty:20,tags:['exotic']},
    {name:'Rabbit (Live)',price:800,unit:'pieces',qty:40,tags:['rabbit']},
    {name:'Rabbit (Dressed)',price:1000,unit:'pieces',qty:35,tags:['rabbit']},
    {name:'Smoked Chicken',price:1200,unit:'pieces',qty:30,tags:['smoked']},
    {name:'Chicken Sausages',price:600,unit:'kg',qty:80,tags:['processed']},
    {name:'Pigeon (Squab)',price:500,unit:'pieces',qty:40,tags:['game']},
    {name:'Goose (Live)',price:2500,unit:'pieces',qty:15,tags:['festive']},
  ],
  Other:[
    {name:'Raw Honey',price:1200,unit:'kg',qty:100,tags:['natural']},
    {name:'Beeswax',price:800,unit:'kg',qty:50,tags:['natural']},
    {name:'Sunflower Oil (Raw)',price:250,unit:'litres',qty:200,tags:['oil']},
    {name:'Virgin Coconut Oil',price:600,unit:'litres',qty:100,tags:['oil','organic']},
    {name:'Aloe Vera Gel',price:500,unit:'litres',qty:80,tags:['medicinal']},
    {name:'Moringa Powder',price:800,unit:'kg',qty:60,tags:['superfood']},
    {name:'Dried Moringa Leaves',price:600,unit:'kg',qty:80,tags:['tea']},
    {name:'Dried Turmeric',price:400,unit:'kg',qty:150,tags:['spice']},
    {name:'Button Mushrooms',price:500,unit:'kg',qty:100,tags:['fungi']},
    {name:'Oyster Mushrooms',price:600,unit:'kg',qty:80,tags:['gourmet']},
    {name:'Dried Mushrooms',price:1500,unit:'kg',qty:40,tags:['dried']},
    {name:'Macadamia Nuts',price:2000,unit:'kg',qty:50,tags:['nuts','export']},
    {name:'Raw Cashew Nuts',price:1500,unit:'kg',qty:80,tags:['nuts']},
    {name:'Sunflower Seeds',price:200,unit:'kg',qty:300,tags:['seeds']},
    {name:'Pumpkin Seeds',price:300,unit:'kg',qty:200,tags:['seeds']},
    {name:'Chia Seeds',price:800,unit:'kg',qty:80,tags:['superfood']},
    {name:'Flax Seeds',price:400,unit:'kg',qty:150,tags:['omega-3']},
    {name:'Sesame Seeds',price:250,unit:'kg',qty:200,tags:['seeds']},
    {name:'Fresh Rosemary',price:200,unit:'bunches',qty:150,tags:['herb']},
    {name:'Fresh Basil',price:150,unit:'bunches',qty:200,tags:['herb']},
    {name:'Fresh Mint',price:100,unit:'bunches',qty:250,tags:['herb','tea']},
    {name:'Lemongrass',price:120,unit:'bunches',qty:200,tags:['herb']},
    {name:'Raw Sugarcane',price:100,unit:'pieces',qty:200,tags:['sugar']},
    {name:'Black Pepper (Dried)',price:1500,unit:'kg',qty:50,tags:['spice']},
    {name:'Cinnamon Sticks',price:800,unit:'kg',qty:60,tags:['spice']},
    {name:'Cardamom',price:3000,unit:'kg',qty:30,tags:['spice']},
    {name:'Dried Hibiscus',price:600,unit:'kg',qty:80,tags:['tea']},
    {name:'Neem Leaves (Dried)',price:300,unit:'kg',qty:100,tags:['medicinal']},
    {name:'Vanilla Pods',price:5000,unit:'kg',qty:20,tags:['premium']},
    {name:'Black Cumin',price:500,unit:'kg',qty:100,tags:['spice','medicinal']},
  ],
};

async function seed() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB');

  const farmerDefs = [
    {name:'Jane Mwangi',phone:'+254712345001',password:'farmer123',role:'farmer',location:{county:'Nakuru',town:'Naivasha'}},
    {name:'Peter Otieno',phone:'+254712345002',password:'farmer123',role:'farmer',location:{county:'Kisumu',town:'Kondele'}},
    {name:'Mary Kamau',phone:'+254712345003',password:'farmer123',role:'farmer',location:{county:'Kiambu',town:'Limuru'}},
    {name:'John Mutua',phone:'+254712345004',password:'farmer123',role:'farmer',location:{county:'Machakos',town:'Athi River'}},
    {name:'Grace Wambua',phone:'+254712345005',password:'farmer123',role:'farmer',location:{county:'Meru',town:'Nkubu'}},
  ];
  const others = [
    {name:'Demo Buyer',phone:'+254712000001',password:'buyer123',role:'buyer',location:{county:'Nairobi',town:'Westlands'}},
    {name:'Sarova Hotel',phone:'+254712000002',password:'hotel123',role:'hotel',location:{county:'Nairobi',town:'CBD'},hotelDetails:{businessName:'Sarova Hotels',businessType:'hotel'}},
    {name:'System Admin',phone:'+254700000001',password:'admin123',role:'admin',location:{county:'Nairobi',town:'CBD'}},
  ];

  const farmers = [];
  for (const def of farmerDefs) {
    let u = await User.findOne({ phone: def.phone });
    if (!u) { u = await User.create(def); console.log(`👨‍🌾 ${u.name}`); } else console.log(`✓ ${u.name}`);
    farmers.push(u);
  }
  for (const def of others) {
    let u = await User.findOne({ phone: def.phone });
    if (!u) { u = await User.create(def); console.log(`✅ ${u.name} (${def.role})`); } else console.log(`✓ ${u.name}`);
  }

  let created = 0;
  for (const [category, items] of Object.entries(PRODUCTS)) {
    let n = 0;
    for (const item of items) {
      if (await Product.findOne({ name: item.name })) continue;
      const farmer = rand(farmers);
      const towns = TOWNS[farmer.location.county] || ['Town Centre'];
      await Product.create({
        name: item.name, category, description: `Fresh ${item.name.toLowerCase()} from ${farmer.location.county}.`,
        quantity: item.qty, unit: item.unit, pricePerUnit: item.price,
        location: { county: farmer.location.county, town: rand(towns) },
        farmer: farmer._id, tags: item.tags, isAvailable: true, isFeatured: Math.random() > 0.85,
      });
      n++; created++;
    }
    console.log(`🌿 ${category}: ${n} new`);
  }

  console.log(`\n✅ ${created} products seeded\n`);
  console.log('╔══════════════════════════════════════╗');
  console.log('║         DEMO CREDENTIALS              ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║ FARMERS  +254712345001-005 farmer123  ║');
  console.log('║ BUYER    +254712000001   buyer123     ║');
  console.log('║ HOTEL    +254712000002   hotel123     ║');
  console.log('║ ADMIN    +254700000001   admin123     ║');
  console.log('╚══════════════════════════════════════╝');
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err.message); process.exit(1); });
