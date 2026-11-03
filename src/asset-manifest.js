/** Public, permanent, CORS-enabled CC0 glTF files from 3DAssets.dev.
 * Files are streamed at runtime and cached by the browser, not bundled in this repository.
 * Each model's source, licence and provenance are recorded in assets/CREDITS.md.
 */
const root = 'https://cdn.3dassets.dev/assets/';
export const ASSETS = Object.freeze({
  banana: {url: root+'38579/v1/model.glb', size: 64, metres: [2.01,2.45,1.603]},
  bamboo: {url: root+'38590/v1/model.glb', size: 312, metres: [1.192,3.304,1.18]},
  tea: {url: root+'36551/v1/model.glb', size: 74, metres: [2.02,2.471,.78]},
  cng: {url: root+'36560/v1/model.glb', size: 28, metres: [1.54,2.188,2.634]},
  bicycle: {url: root+'36561/v1/model.glb', size: 54, metres: [.52,1.09,1.874]},
  motorcycle: {url: root+'36564/v1/model.glb', size: 37, metres: [.64,1.081,1.717]},
  charpoy: {url: root+'36568/v1/model.glb', size: 30, metres: [.92,.48,1.9]},
});
export const MISSIONS = [
  {x:19,z:-25,name:'গ্রামের বাড়ি',message:'🏡 গ্রামের বাড়ি ঘুরে দেখা শেষ!'},
  {x:24,z:-58,name:'পুকুরপাড়',message:'🪷 পুকুরপাড়ে পৌঁছেছ!'},
  {x:-17,z:-91,name:'চায়ের দোকান',message:'☕ বাজারের চায়ের দোকানে পৌঁছেছ!'}
];
