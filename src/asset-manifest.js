/** Public, permanent, CORS-enabled CC0 glTF files from 3DAssets.dev.
 * Files are streamed at runtime and cached by the browser, not bundled in this repository.
 * Each model's source, licence and provenance are recorded in assets/CREDITS.md.
 */
const root = 'https://cdn.3dassets.dev/assets/';
export const ASSETS = Object.freeze({
  banana: {url: root+'38579/v1/model.glb', size: 64, metres: [2.01,2.45,1.603]},
  // CC0 rural-life additions: sparse mobile placement, not AAA photogrammetry.
  ricePlant: {url: root+'19389/v1/model.glb', metres: [.484,.819,.45]},
  villageMan: {url: root+'36378/v1/model.glb', metres: [.616,1.76,.305]},
  villageWoman: {url: root+'36379/v1/model.glb', metres: [.511,1.668,.607]},
  bamboo: {url: root+'38590/v1/model.glb', size: 312, metres: [1.192,3.304,1.18]},
  tea: {url: root+'36551/v1/model.glb', size: 74, metres: [2.02,2.471,.78]},
  cng: {url: root+'36560/v1/model.glb', size: 28, metres: [1.54,2.188,2.634]},
  bicycle: {url: root+'36561/v1/model.glb', size: 54, metres: [.52,1.09,1.874]},
  motorcycle: {url: root+'36564/v1/model.glb', size: 37, metres: [.64,1.081,1.717]},
  charpoy: {url: root+'36568/v1/model.glb', size: 30, metres: [.92,.48,1.9]},
  cow: {url: root+'29184/v1/model.glb', size: 374, metres: [.86,2.1,2.8]},
  jersey: {url: root+'29185/v1/model.glb', size: 366, metres: [.86,2.1,2.8]},
  goat: {url: root+'29192/v1/model.glb', size: 352, metres: [.8,1.4,1.5]},
  shrubs: {url: root+'36145/v1/model.glb', size: 145, metres: [2.6,1.23,2.67]},
  palm: {url: root+'36142/v1/model.glb', size: 58, metres: [2.57,2.64,2.85]},
  hay: {url: root+'29213/v1/model.glb', size: 213, metres: [1.52,1.52,1.22]},
  waterTrough: {url: root+'29217/v1/model.glb', size: 373, metres: [1.8,.7,.8]},
  milkChurns: {url: root+'29219/v1/model.glb', size: 221, metres: [1.2,.7,.7]},
  wheelbarrow: {url: root+'29218/v1/model.glb', size: 445, metres: [1.8,.8,1.0]},
  coconutPalm: {url: root+'6797/v1/model.glb', size: 214, metres: [5.3,9,5.2]},
  tropicalCanopy: {url: root+'6818/v1/model.glb', size: 168, metres: [8.607,11.291,8.499]},
});
// Mission interaction points are outside blocked buildings and pond water.
export const MISSIONS = [
  {x:12,z:-25,name:'মেম্বারের সঙ্গে কথা বলো',action:'কথা বলো',message:'মেম্বার: পুকুরপাড়ে একটি জরুরি কাগজ হারিয়ে গেছে। সেটি খুঁজে আনো।',reward:50},
  {x:12,z:-58,name:'পুকুরপাড়ে হারানো কাগজ খুঁজে নাও',action:'কাগজ নাও',message:'📜 হারানো কাগজটি পাওয়া গেছে! এখন বাজারের চায়ের দোকানে পৌঁছে দাও।',reward:100},
  {x:-10,z:-86,name:'চায়ের দোকানে কাগজ পৌঁছে দাও',action:'জমা দাও',message:'☕ দোকানি: ধন্যবাদ! গ্রামের কাজটি শেষ হয়েছে।',reward:250}
];
