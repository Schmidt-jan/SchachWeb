import {ChessGameField} from "./move_calculator";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import {CanvasTexture, Object3D, OrthographicCamera, PerspectiveCamera, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {FigureTypes, Player} from "./models/GameField";
import {degToRad} from "three/src/math/MathUtils";
import {WebChessApiWs} from "./webChessApiWs";

let mainPlayer: Player;
let enemy: Player;


export namespace ChessBoard {
    import MovePiece = WebChessApiWs.MovePiece;
    let scene: THREE.Scene = new THREE.Scene();
    let camera: PerspectiveCamera | OrthographicCamera;
    let renderer: WebGLRenderer = new THREE.WebGLRenderer({antialias: true});
    let controls: OrbitControls;
    let objects: THREE.Object3D[] = [];
    let pawn: undefined | Object3D = undefined;
    let knight: undefined | Object3D = undefined;
    let bishop: undefined | Object3D = undefined;
    let rook: undefined | Object3D = undefined;
    let queen: undefined | Object3D = undefined;
    let king: undefined | Object3D = undefined;
    let figures: Object3D[] = [];
    let selectedFigure: undefined | Object3D = undefined;
    let highlightedCells: Object3D[] = [];
    let chessGameField: undefined | ChessGameField = undefined;
    let animate = false;
    let elementParent: HTMLElement;
    let g3d: boolean
    let ws: WebSocket;
    let player: Player;
    let currPlayer: Player;

    export function init(_player: Player, parent: HTMLElement, _ws: WebSocket, _g3d: boolean = false) {
        player = _player;
        elementParent = parent
        ws = _ws;
        g3d = _g3d;


        renderer.setSize(parent.offsetWidth, parent.offsetWidth);
        scene.clear();
        mainPlayer = Player.White;

        scene.background = new THREE.Color(0xffffff);
        scene.add(new THREE.HemisphereLight(0xffffff, 0.8))
        const light = new THREE.DirectionalLight(0xffffff, 0.5)
        light.position.set(0, -5, 5);
        scene.add(light);

        renderer.setPixelRatio(window.devicePixelRatio)
        elementParent.appendChild(renderer.domElement);
        createBoard();

        if (g3d) {
            setView3D()
        } else {
            setView2D()
        }
        render();
    }

    export function setView3D() {
        g3d = true;
        camera = new THREE.PerspectiveCamera(50, elementParent.offsetWidth / elementParent.offsetHeight, 0.1, 1000);
        if (player === Player.White) {
            camera.position.set(-4.5, 12 / camera.aspect, -5);
        } else {
            camera.position.set(-4.5, 12 / camera.aspect, 15);
        }
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(-4.5, 0, 4.5)
        controls.maxPolarAngle = Math.PI / 2
        controls.minPolarAngle = -Math.PI / 2
        controls.enabled = true
    }

    export function setView2D() {
        g3d = false
        camera = new THREE.PerspectiveCamera(50, elementParent.offsetWidth / elementParent.offsetWidth, 0.1, 1000);
        camera.position.set(-4.5, 12 / camera.aspect, 4.5);
        if (player === Player.White) {
            camera.up = new THREE.Vector3(0, -1, 1).normalize();
        } else {
            camera.up = new THREE.Vector3(0, -1, -1).normalize();
        }
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(-4.5, 0, 4.5)

        controls.enabled = false
    }

    function drawKS() {
        const xMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
        const xPoints = [];
        xPoints.push(new THREE.Vector3(0, 0, 0));
        xPoints.push(new THREE.Vector3(10, 0, 0));
        const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
        const xLine = new THREE.Line(xGeometry, xMaterial);
        scene.add(xLine);


        const yMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
        const yPoints = [];
        yPoints.push(new THREE.Vector3(0, 0, 0));
        yPoints.push(new THREE.Vector3(0, 10, 0));
        const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
        const yLine = new THREE.Line(yGeometry, yMaterial);
        scene.add(yLine);

        const zMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
        const zPoints = [];
        zPoints.push(new THREE.Vector3(0, 0, 0));
        zPoints.push(new THREE.Vector3(0, 0, 10));
        const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
        const zLine = new THREE.Line(zGeometry, zMaterial);
        scene.add(zLine);

    }


    function createBoard() {
        const board = new THREE.Group();
        let cellBlack = false;
        let columnCt = 0;

        for (const letter of Array('', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '')) {
            for (const row of Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)) {
                const cellGeometry = new THREE.BoxGeometry(1, 0.1, 1);

                // beschriftung
                let isDescRow = row === 0 || row === 9;
                let isDescColumn = letter.length === 0;
                if (isDescRow || isDescColumn) {
                    let canvas: HTMLCanvasElement = isDescRow ? createCanvas(letter) : createCanvas(row.toString())
                    const cellMaterial = new THREE.MeshPhongMaterial({
                        flatShading: true,
                        map: new CanvasTexture(canvas)
                    });
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(-columnCt, 0, row);
                    if (mainPlayer === Player.White) {
                        cell.rotateZ(Math.PI);
                    }
                    scene.add(cell);
                } else {
                    const cellMaterial = new THREE.MeshPhongMaterial({
                        color: cellBlack ? 0x3d2b1f : 0xffe4b5,
                        flatShading: true
                    });
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(-columnCt, 0, row);
                    if (mainPlayer === Player.White) {
                        cell.rotateZ(Math.PI);
                    }
                    scene.add(cell);
                    cellBlack = !cellBlack;
                }
            }

            cellBlack = !cellBlack;
            columnCt++;
        }
    }

    function createCanvas(text: string): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        canvas.width = canvas.height = 256;
        if (ctx) {
            ctx.beginPath();
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 10
            ctx.strokeRect(0, 0, 256, 256);
            ctx.rect(0, 0, 256, 256);

            ctx.fillStyle = '#3d2b1f';
            ctx.fill();
            ctx.fillStyle = '#ffe4b5';
            ctx.stroke();
            ctx.font = '128px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 128);
        }

        return canvas;
    }

    export async function loadFigures(): Promise<void> {
        const loader = new OBJLoader();
        let cntModelsLoaded = 0;

        return new Promise((res) => {
            loader.load('assets/3dModels/Pawn.obj', (obj) => {
                pawn = obj.children[0];
                pawn.scale.set(.8, .8, .8)

                if (++cntModelsLoaded == 6) {
                    res();
                }
            })
            loader.load('assets/3dModels/Rook.obj', (obj) => {
                rook = obj.children[0];
                rook.scale.set(.8, .8, .8)
                if (++cntModelsLoaded == 6) {
                    res();
                }
            })

            loader.load('assets/3dModels/Bishop.obj', (obj) => {
                bishop = obj.children[0];
                bishop.scale.set(.8, .8, .8)
                if (++cntModelsLoaded == 6) {
                    res();
                }
            })

            loader.load('assets/3dModels/Knight.obj', (obj) => {
                knight = obj.children[0];
                knight.scale.set(.8, .8, .8)
                if (++cntModelsLoaded == 6) {
                    res();
                }
            })

            loader.load('assets/3dModels/Queen.obj', (obj) => {
                queen = obj.children[0];
                queen.scale.set(.8, .8, .8)
                if (++cntModelsLoaded == 6) {
                    res();
                }
            })

            loader.load('assets/3dModels/King.obj', (obj) => {
                king = obj.children[0];
                king.scale.set(.8, .8, .8)
                if (++cntModelsLoaded == 6) {
                    res();
                }
            })
        })
    }

    export function setFigures(gameField: ChessGameField) {
        chessGameField = gameField;
        gameField.flatGameField.forEach((figure) => {
            setFigure(figure.figure, [[figure.x + 1, figure.y + 1]], figure.color === Player.Black)
        });
    }

    function setFigure(type: FigureTypes, positions: [number, number][], colorBlack: boolean = false) {
        for (const [x, y] of positions) {
            let figure = cloneFigure(type);
            figure.position.set(-x, 0, y);
            // @ts-ignore
            figure.isFigure = true;
            // @ts-ignore
            figure.color = colorBlack ? Player.Black : Player.White
            if (colorBlack) {
                figure.rotateY(-Math.PI);
                // @ts-ignore
                figure.material = new THREE.MeshPhongMaterial({color: 0x8b4514, shininess: 30})
            } else {
                // @ts-ignore
                figure.material = new THREE.MeshPhongMaterial({color: 0xf4a460, shininess: 30})
            }
            figures.push(figure);
            scene.add(figure);
        }
    }

    function cloneFigure(type: FigureTypes): Object3D {
        if (!pawn || !rook || !bishop || !knight || !queen || !king) {
            throw new Error(`3D models are not loaded`);
        }

        switch (type) {
            case FigureTypes.Pawn:
                return pawn.clone();
            case FigureTypes.Rook:
                return rook.clone();
            case FigureTypes.Bishop:
                return bishop.clone();
            case FigureTypes.Knight:
                return knight.clone();
            case FigureTypes.Queen:
                return queen.clone();
            case FigureTypes.King:
                return king.clone();
        }
    }

    function render() {
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera)
    }

    export async function onClick(event: MouseEvent) {
        event.preventDefault();
        stopAnimation()
        let mouse3D = new THREE.Vector2(((event.clientX - elementParent.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1,
            -((event.clientY - elementParent.offsetTop) / renderer.domElement.clientHeight) * 2 + 1)

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse3D, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            let obj = intersects.at(0);
            if (obj) {
                await handleIntersection(obj.object);
            }
        }
    }

    async function handleIntersection(obj: Object3D) {
        if (currPlayer !== player) {
            return;
        }

        // @ts-ignore
        if (obj.isFigure && !selectedFigure) {
            selectedFigure = obj;
            obj.position.y = 0.5;
            // @ts-ignore
            //if (toggleHints?.checked) {
                showPossibleMoves(-(obj.position.x), obj.position.z);
            //}
            return;
        }

        // @ts-ignore
        if (obj.isFigure && selectedFigure) {
            // @ts-ignore
            if (obj !== selectedFigure && obj.color === player) {
                // @ts-ignore
                selectedFigure?.position.y = 0;
                selectedFigure = undefined;
                scene.remove(...highlightedCells);
                highlightedCells = [];

                selectedFigure = obj;
                obj.position.y = 0.5;
                // @ts-ignore
                if (toggleHints?.checked) {
                    showPossibleMoves(-(obj.position.x), obj.position.z);
                }
                return;
            }
            if (obj === selectedFigure) {
                // @ts-ignore
                selectedFigure?.position.y = 0;
                selectedFigure = undefined;
                scene.remove(...highlightedCells);
                highlightedCells = [];
                return
            }
        }

        if (selectedFigure) {
            const req: MovePiece = {
                fromX: -(selectedFigure.position.x + 1),
                fromY: selectedFigure.position.z - 1,
                toX: -(obj.position.x + 1),
                toY: obj.position.z - 1
            };

            WebChessApiWs.movePiece(ws, req);
            /*
            let chessField = await WebChessApi.movePiece(req)
            if (labelPlayer) {
                labelPlayer.innerHTML = chessField.player.toString();
            }
            if (labelState) {
                labelState.innerHTML = chessField.status
            }

            switch (chessField.status) {
                case "RUNNING":
                    // @ts-ignore
                    if(toggleSound?.checked) {
                        clickAudio.play();
                    }
                    break;
                case "INVALID MOVE":
                    return
            }

            updateField(chessField);
            // @ts-ignore
            if (toggleAutoRotate?.checked) {
                if (chessField.player === Player.White) {
                    await rotateToWhite()
                } else {
                    await rotateToBlack()
                }
            }

            switch (chessField.status) {
                case "CHECKMATE":
                    // @ts-ignore
                    if(toggleSound?.checked) {
                        gameWinAudio.play();
                    }
                    let winner = (chessField.player === Player.White) ? Player.Black : Player.White;
                    alert(`${winner} WINS`);
                    break;
                case "PAWN HAS REACHED THE END":
                    do {
                        let figure = prompt("Pawn has reached end. You can convert it. Enter the figure you want to change it to. \nFigures: 'rook', 'bishop', 'knight', 'queen'");
                        if (figure) {
                            chessField = await WebChessApi.convertPawn({toFigure: figure})
                        }
                    } while(chessField.status === "INVALID CONVERSION");

                    updateStateView(chessField);
                    await updateField(chessField);
                    break;
                case "CHECKED":
                    // @ts-ignore
                    if(toggleSound?.checked) {
                        attackingAudio.play();
                    }
                    alert(`${chessField.player} is under attack`);
                    break;
            }

             */
        }
    }

    export function updateField(chessField: ChessGameField) {
        currPlayer = chessField.player;
        selectedFigure = undefined;
        scene.remove(...highlightedCells);
        highlightedCells = [];
        scene.remove(...figures);
        figures = [];
        setFigures(chessField);
    }

    export async function rotateToBlack() {
        const rad = 9.5;
        const cameraStartX = -4.5
        const cameraStartZ = -4.5
        if (g3d) {
            for (let angle = 0; angle <= 180; angle++) {
                let deltaX = rad * Math.sin((degToRad(angle)));
                let deltaZ = rad * Math.cos((degToRad(angle)));
                camera.position.set(cameraStartX + deltaX, camera.position.y, 4.5 - deltaZ);
                controls.target.set(-4.5, 0, 4.5);
                await sleep(5);
            }
        } else {
            for (let angle= 0; angle >= -180; angle--) {
                camera.position.set(-4.5, 12, 4.5);
                let vecX = Math.sin(degToRad(angle))
                let vecZ = Math.cos(degToRad(angle))
                camera.up = new THREE.Vector3(vecX, -1, vecZ).normalize();
                controls.target.set(-4.5, 0, 4.5)
                await sleep(5)
            }
        }

    }

    export async function rotateToWhite() {
        const rad = 9.5;
        const cameraStartX = -4.5
        const cameraStartZ = 14
        if (g3d) {
            for (let angle = 0; angle >= -180; angle--) {
                let deltaX = rad * Math.sin((degToRad(angle)));
                let deltaZ = rad * Math.cos((degToRad(angle)));
                camera.position.set(cameraStartX + deltaX, camera.position.y, 4.5 + deltaZ);
                controls.target.set(-4.5, 0, 4.5);
                await sleep(5);
            }
        } else {
            const zStart = camera.up.z
            console.log(camera.up)
            for (let angle= 0; angle <= 180; angle++) {
                camera.position.set(-4.5, 12, 4.5);
                let vecX = Math.sin(degToRad(angle))
                let vecZ = Math.cos(degToRad(angle))
                camera.up = new THREE.Vector3(vecX, -1, - vecZ).normalize();
                controls.target.set(-4.5, 0, 4.5)
                await sleep(5)
            }
        }
    }

    function showPossibleMoves(x: number, y: number) {
        scene.remove(...highlightedCells);
        highlightedCells = [];

        if (!chessGameField) {
            throw new Error('No game field loaded');
        }
        let figure = chessGameField.gameField.at(x - 1)?.at(y - 1);
        if (figure) {
            let possibleMoves = chessGameField.getPossibleMoves(figure, true);
            for (const [x, y] of possibleMoves) {
                let geometry = new THREE.PlaneGeometry();
                const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: 0xffa500});
                const highlight = new THREE.Mesh(geometry, material);
                highlight.position.set(-(x + 1), 0.051, y + 1);
                highlight.rotateX(-Math.PI / 2)
                highlightedCells.push(highlight);
                scene.add(highlight);

            }
        }
    }

    export function setPlayer(player: Player) {
        mainPlayer = player;
        enemy = mainPlayer === Player.White ? Player.Black : Player.White;
        stopAnimation();
        if (mainPlayer == Player.White) {
            camera.position.x = -4.5
            camera.position.y = 15
            camera.position.z = -5
        } else {
            camera.position.x = -4.5
            camera.position.z = 15
            camera.position.y = 15
        }
    }

    export function startAnimation() {
        controls.autoRotate = true
    }

    export function stopAnimation() {
        controls.autoRotate = false
    }

    export function onWindowResize() {
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = elementParent.offsetWidth / elementParent.offsetWidth
            camera.position.y = 12 / camera.aspect
        }
        camera.updateProjectionMatrix()
        renderer.setSize(elementParent.offsetWidth, elementParent.offsetWidth)
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}