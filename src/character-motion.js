import * as THREE from 'three';

/** Humanoid anti-T-pose controller.
 * Uses real embedded Walk/Run clips when properly bound to the skeleton,
 * with an always-available hand-built breathing/standing and locomotion pose.
 * All rotations are restored from the GLB bind pose each idle frame.
 */
export function createCharacterMotion(root, animations = []) {
  const bones = {};
  const rest = {};
  const clipActions = {};
  const mixer = new THREE.AnimationMixer(root);
  const clean = n => (n || '').toLowerCase().replace(/mixamorig|armature|rig|_|\s|:|\./g, '');
  root.traverse(obj => {
    if (!obj.isBone) return;
    const n = clean(obj.name);
    if (/^leftarm$|^leftupperarm$|^upperarml$/.test(n)) bones.leftArm = obj;
    if (/^rightarm$|^rightupperarm$|^upperarmr$/.test(n)) bones.rightArm = obj;
    if (/^leftforearm$|^leftlowerarm$/.test(n)) bones.leftForeArm = obj;
    if (/^rightforearm$|^rightlowerarm$/.test(n)) bones.rightForeArm = obj;
    if (/^leftupleg$|^leftthigh$|^leftupperleg$/.test(n)) bones.leftLeg = obj;
    if (/^rightupleg$|^rightthigh$|^rightupperleg$/.test(n)) bones.rightLeg = obj;
    if (/^leftleg$|^leftcalf$|^leftlowerleg$/.test(n)) bones.leftKnee = obj;
    if (/^rightleg$|^rightcalf$|^rightlowerleg$/.test(n)) bones.rightKnee = obj;
    if (/^spine$|^spine1$|^spine01$/.test(n)) bones.spine = obj;
    if (/^head$/.test(n)) bones.head = obj;
    rest[obj.uuid] = obj.quaternion.clone();
  });
  const allBoneNames = new Set();
  root.traverse(obj => { if (obj.isBone) allBoneNames.add(obj.name); });
  for (const clip of animations) {
    const name = (clip.name || '').toLowerCase();
    const type = name.includes('run') ? 'run' : name.includes('walk') ? 'walk' : name.includes('idle') ? 'idle' : null;
    if (!type) continue;
    const bound = clip.tracks.filter(track => {
      const node = track.name.split('.')[0];
      return allBoneNames.has(node) || !!root.getObjectByName(node);
    });
    // An unbound clip causes an unanimated T pose even when mixer updates.
    if (bound.length < 6) continue;
    clipActions[type] = mixer.clipAction(clip);
  }
  const hasArms = !!(bones.leftArm && bones.rightArm);
  let active = null;
  const axisX = new THREE.Vector3(1, 0, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);
  const tmp = new THREE.Quaternion();
  function pose(bone, axis, angle) {
    if (!bone) return;
    bone.quaternion.copy(rest[bone.uuid] || bone.quaternion);
    tmp.setFromAxisAngle(axis, angle);
    bone.quaternion.premultiply(tmp);
  }
  function transition(next) {
    if (active === next) return;
    if (active) active.fadeOut(.14);
    if (next) next.reset().fadeIn(.16).play();
    active = next;
  }
  function update(dt, speed, elapsed, riding = false) {
    const moving = !riding && speed > .3;
    const use = moving ? (speed > 5.4 ? clipActions.run || clipActions.walk : clipActions.walk || clipActions.run) : null;
    if (use) {
      // Reset procedural changes before the mixer applies its complete pose.
      for (const bone of Object.values(bones)) if (bone && rest[bone.uuid]) bone.quaternion.copy(rest[bone.uuid]);
      transition(use);
      mixer.update(dt);
      return;
    }
    // A visual idle pose is mandatory: nobody should spawn in T-pose.
    if (active) {
      active.stop();
      active = null;
    }
    const gait = moving ? Math.min(.67, speed * .1) : 0;
    const step = Math.sin(elapsed * (speed > 5.4 ? 11.8 : 8.6));
    const breath = Math.sin(elapsed * 1.65) * .025;
    if (hasArms) {
      pose(bones.leftArm, axisZ, 1.04 + breath + step * gait * .24);
      pose(bones.rightArm, axisZ, -1.04 - breath + step * gait * .24);
      pose(bones.leftForeArm, axisX, -.14);
      pose(bones.rightForeArm, axisX, -.14);
    }
    pose(bones.leftLeg, axisX, -step * gait);
    pose(bones.rightLeg, axisX, step * gait);
    pose(bones.leftKnee, axisX, Math.max(0,step) * gait * .28);
    pose(bones.rightKnee, axisX, Math.max(0,-step) * gait * .28);
    pose(bones.spine, axisZ, Math.sin(elapsed * 1.4) * .013);
    pose(bones.head, axisZ, Math.sin(elapsed * .7) * .008);
  }
  return { update, hasArms, usableClips: Object.keys(clipActions), boneCount: allBoneNames.size };
}
