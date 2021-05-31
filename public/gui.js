const objectFolders = [];

const loadGUI = (gui, guiRoot, camera, camera2, camera3, selectedCamera, indexOfCameras, animation, lookingAtOrigin) => {
  gui.add(guiRoot, "addObject");
  gui.add(lookingAtOrigin, "Origin");

  const animationFolder = gui.addFolder("Animation");
  animationFolder.add(animation, "indexOfObjeto", animation.objetos).listen();
  animationFolder.add(animation, "animateMaster");
  const aniRotationFolder = animationFolder.addFolder("Rotation");
  aniRotationFolder.add(animation, "rotationSpeed", 10, 180, 15);
  aniRotationFolder.add(animation, "rotationX", 0, 360, 15);
  aniRotationFolder.add(animation, "rotationY", 0, 360, 15);
  aniRotationFolder.add(animation, "rotationZ", 0, 360, 15);
  aniRotationFolder.add(animation, "animateRotate");

  const aniTranslationFolder = animationFolder.addFolder("Translation");
  aniTranslationFolder.add(animation, "translationSpeed", 1, 10, 1);
  aniTranslationFolder.add(animation, "translationX", 0, 20, 1);
  aniTranslationFolder.add(animation, "translationY", 0, 20, 1);
  aniTranslationFolder.add(animation, "translationZ", 0, 20, 1);
  aniTranslationFolder.add(animation, "animateTranslate");

  const camerasFolder = gui.addFolder("Cameras");
  camerasFolder.add(selectedCamera, "camera", indexOfCameras);
  const cameraFolder = camerasFolder.addFolder("Camera1");
  const ProjectionFolder = cameraFolder.addFolder("Projection");
  ProjectionFolder.add(camera, "fieldOfView", -180, 180, 10);
  ProjectionFolder.add(camera, "aspectRatio", -5, 5, 0.5);
  ProjectionFolder.add(camera, "near", 1e-4, 8, 0.5);
  ProjectionFolder.add(camera, "far", 0, 100, 0.5);
  
  const viewFolder = cameraFolder.addFolder("View");
  viewFolder.add(camera, "viewX", -10, 10, 1);
  viewFolder.add(camera, "viewY", -10, 10, 1);
  viewFolder.add(camera, "viewZ", -10, 10, 1);
  
  const rotationFolder = cameraFolder.addFolder("Rotation");
  rotationFolder.add(camera, "rotationX", -180, 180, 15);
  rotationFolder.add(camera, "rotationY", -180, 180, 15);
  rotationFolder.add(camera, "rotationZ", -180, 180, 15);

  const camera2Folder = camerasFolder.addFolder("Camera2");
  const Projection2Folder = camera2Folder.addFolder("Projection");
  Projection2Folder.add(camera2, "fieldOfView", -180, 180, 10);
  Projection2Folder.add(camera2, "aspectRatio", -5, 5, 0.5);
  Projection2Folder.add(camera2, "near", 1e-4, 8, 0.5);
  Projection2Folder.add(camera2, "far", 0, 100, 0.5);

  const view2Folder = camera2Folder.addFolder("View");
  view2Folder.add(camera2, "viewX", -10, 10, 1);
  view2Folder.add(camera2, "viewY", -10, 10, 1);
  view2Folder.add(camera2, "viewZ", -10, 10, 1);
  
  const rotation2Folder = camera2Folder.addFolder("Rotation");
  rotation2Folder.add(camera2, "rotationX", -180, 180, 15);
  rotation2Folder.add(camera2, "rotationY", -180, 180, 15);
  rotation2Folder.add(camera2, "rotationZ", -180, 180, 15);

  const camera3Folder = camerasFolder.addFolder("Camera3");
  const Projection3Folder = camera3Folder.addFolder("Projection");
  Projection3Folder.add(camera3, "fieldOfView", -180, 180, 10);
  Projection3Folder.add(camera3, "aspectRatio", -5, 5, 0.5);
  Projection3Folder.add(camera3, "near", 1e-4, 8, 0.5);
  Projection3Folder.add(camera3, "far", 0, 100, 0.5);

  const view3Folder = camera3Folder.addFolder("View");
  view3Folder.add(camera3, "viewX", -10, 10, 1);
  view3Folder.add(camera3, "viewY", -10, 10, 1);
  view3Folder.add(camera3, "viewZ", -10, 10, 1);
  
  const rotation3Folder = camera3Folder.addFolder("Rotation");
  rotation3Folder.add(camera3, "rotationX", -180, 180, 15);
  rotation3Folder.add(camera3, "rotationY", -180, 180, 15);
  rotation3Folder.add(camera3, "rotationZ", -180, 180, 15);
};

const GUIAddObject = (gui, object, objectsToDraw) => {
  const objectFolder = gui.addFolder("Object" + objectsToDraw.length);
  objectFolders.push(objectFolder);
  objectFolder.add(object, "changeColors");
  objectFolder.add(object, "lookAt");

  const translationFolder = objectFolder.addFolder("Translation");
  translationFolder.add(object, "translationX", -20, 20, 0.5).listen();
  translationFolder.add(object, "translationY", -20, 20, 0.5).listen();
  translationFolder.add(object, "translationZ", -20, 20, 1).listen();

  const rotationFolder = objectFolder.addFolder("Rotation");
  rotationFolder.add(object, "rotationX", -180, 180, 15).listen();
  rotationFolder.add(object, "rotationY", -180, 180, 15).listen();
  rotationFolder.add(object, "rotationZ", -180, 180, 15).listen();

  const scaleFolder = objectFolder.addFolder("Scale");
  scaleFolder.add(object, "scaleX", -2, 2, 0.1);
  scaleFolder.add(object, "scaleY", -2, 2, 0.1);
  scaleFolder.add(object, "scaleZ", -2, 2, 0.1);
};
