function eventsListeners(camera){
    const canvas = document.querySelector('canvas');
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    canvas.onclick = function() {
        canvas.requestPointerLock()
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    //window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas(){
        console.log("Resize!!!");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            document.addEventListener("mousemove", updateRotation, false);
        } else {
            document.removeEventListener("mousemove", updateRotation, false);
        }
    }

    function updateRotation(e) {
        let x = e.movementX;
        let y = e.movementY;
        if(camera.rotationX >= 360 || camera.rotationX >= -360){
            camera.rotationX -= 360;
        }
        if(camera.rotationY >= 360 || camera.rotationY >= -360){
            camera.rotationX -= 360;
        }
        camera.rotationX += (y/2) * -1;
        camera.rotationY += (x/2) * -1;
    }
}