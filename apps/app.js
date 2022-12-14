import { Address } from "./address.js";
import { BimServerClient } from "../bimserver-api/bimserverclient.js";
import { BimServerViewer } from "../viewer/bimserverviewer.js";
import { AbstractViewer } from "../viewer/abstractviewer.js";
import { Stats } from "../viewer/stats.js";
import { Settings } from "../viewer/settings.js";
import { ProjectTreeModel } from "../viewer/projecttreemodel.js";
import { TreeView } from "../viewer/treeview.js";
import { Credentials } from "./credentials.js";
import { ThreeDTileLoader } from "../viewer/threedtileloader.js";
import * as mat4 from "../viewer/glmatrix/mat4.js";
import Cartesian3 from "../viewer/cesium/Core/Cartesian3.js";
import Transforms from "../viewer/cesium/Core/Transforms.js";
import {
	CLICK_MEASURE_PATH,
	CLICK_MEASURE_DIST,
	CLICK_SELECT,
} from "../viewer/cameracontrol.js";
import { configureProvider } from "../extensions/providers/configureprovider.js";
import GlobalProvider from "../extensions/providers/globalprovider.js";
import IssueController from "../extensions/issues/issuecontroller.js";
import { Viewer } from "../viewer/viewer.js";
import Issue from "../extensions/issues/issue.js";

/*
 * This class is where the applications starts, it's a mess, needs to go when we change this into an API
 */

export class App {
	start() {
		this.animationEnabled = false;

		this.settingsView = new Settings(document.getElementById("settings"));
		document.getElementById("backButton").addEventListener("click", () => {
			if (this.bimServerViewer != null) {
				document.removeEventListener("keypress", this.keyPressHandler);
				window._debugViewer = null;
				window.tilingRenderLayer = null;
				window.defaultRenderLayer = null;
				this.canvas.remove();
				this.canvas = null;
				this.bimServerViewer.cleanup();
				this.bimServerViewer = null;
			}
			this.loadProjects();
		});

		// Deep-clone the settings, so we know we have a non-changing view of the settings
		this.settings = JSON.parse(JSON.stringify(this.settingsView.settings));
		//this.settings.drawTileBorders = true;

		this.api = new BimServerClient(Address.getApiAddress());
		this.api.init(() => {
			new Credentials(this.api).getCredentials().then(() => {
				this.loadProjects();
			});
		});

		// ! For POC, configure the global provider for other extension features
		configureProvider(this);
	}

	/**
	 *
	 * @returns { BimServerViewer | AbstractViewer }
	 */
	getBimViewer() {
		return this.bimServerViewer;
	}

	/**
	 *
	 * @returns { Viewer }
	 */
	getViewer() {
		return this.bimServerViewer?.viewer;
	}

	getApiClient() {
		return this.api;
	}

	loadProjects() {
		document.getElementById("viewer").style.display = "none";
		document.getElementById("projectsWrapper").style.display = "block";

		var treeView = new TreeView(document.getElementById("projects"));
		this.projectTreeModel = new ProjectTreeModel(this.api, treeView);
		let onload = function () {
			if (this.projectTreeModel.children.length == 1) {
				this.loadModel(this.projectTreeModel.children[0].project);
			}
		}.bind(this);
		this.projectTreeModel
			.load((node) => {
				this.loadModel(node.project);
			})
			.done(onload);
	}

	keyPressListener(event) {
		if (event.key == " ") {
			event.preventDefault();
			this.animationEnabled = !this.animationEnabled;
			this.bimServerViewer.viewer.navigationActive = this.animationEnabled;
		}
	}

	loadModel(project) {
		document.getElementById("projectsWrapper").style.display = "none";
		document.getElementById("viewer").style.display = "block";

		this.animationEnabled = false;

		var canvasWrapper = document.getElementById("canvasWrapper");
		this.canvas = document.createElement("canvas");
		this.canvas.className = "full";
		canvasWrapper.appendChild(this.canvas);

		var stats = new Stats();

		stats.setParameter("Models", "Name", project.name);

		console.log(this.settings);

		this.bimServerViewer = new BimServerViewer(
			this.settings,
			this.canvas,
			window.innerWidth,
			window.innerHeight,
			stats
		);

		this.bimServerViewer.setProgressListener((percentage) => {
			document.getElementById("progress").style.display = "block";
			document.getElementById("progress").style.width = percentage + "%";
			if (percentage == 100) {
				document.getElementById("progress").style.display = "none";
			}
		});

		this.bimServerViewer.viewer.addAnimationListener((deltaTime) => {
			if (this.animationEnabled) {
				this.bimServerViewer.viewer.camera.orbitYaw(0.3);
			}
		});

		this.keyPressHandler = (event) => {
			this.keyPressListener(event);
		};
		this.canvas.addEventListener("keypress", this.keyPressHandler);
		console.log(project)
		this.bimServerViewer.loadModel(this.api, project);

		let buttons = Array.from(document.querySelector("#toolbar").children);
		buttons.forEach((bt, i) => {
			if (i == 0) {
				bt.onclick = () => {
					this.bimServerViewer.viewer.cameraControl.clickMode = CLICK_SELECT;
					if (this.bimServerViewer.viewer.activeMeasurement) {
						if (this.bimServerViewer.viewer.activeMeasurement.num_points > 1) {
							this.bimServerViewer.viewer.commitActiveMeasurement();
						} else {
							this.bimServerViewer.viewer.destroyActiveMeasurement();
						}
					}
				};
			}
			if (i == 1) {
				bt.onclick = () => {
					if (!this.bimServerViewer.viewer.activeMeasurement) {
						this.bimServerViewer.viewer.cameraControl.clickMode =
							CLICK_MEASURE_DIST;
					}
				};
			}
			if (i == 2) {
				bt.onclick = () => {
					if (!this.bimServerViewer.viewer.activeMeasurement) {
						this.bimServerViewer.viewer.cameraControl.clickMode =
							CLICK_MEASURE_PATH;
					}
				};
			}
			if (i == 3) {
				bt.onclick = () => {
					this.bimServerViewer.viewer.deleteAllMeasurements();
					this.bimServerViewer.viewer.cameraControl.clickMode = CLICK_SELECT;
				};
			}
		});

		// @todo Elevation does not need to be multiplied into the glTF positions, but can
		// be supplied in Cartesian3.fromDegrees().

		// @todo this needs to be encapsulated in some function of some sorts, preferably also
		// a UI that displays where the data is coming from. We make very little use of
		// Cesium functionality maybe better to do a quick reimplementation using glMatrix.

		// Example: load glTF
		// setTimeout(() => { this.bimServerViewer.loadGltf({url:"/assets/eindhoven.glb"}); }, 2000);

		// Example1: load 3D Tiles for schependomlaan
		// const refLatitude = 51.841982;
		// const refLongitude = 5.836029;
		// const refElevation = 11.;
		// let cesiumMatrix = Transforms.eastNorthUpToFixedFrame(
		// 		Cartesian3.fromDegrees(refLongitude, refLatitude, 0.)
		// );
		// let northRotation = new Float64Array(16);
		// mat4.fromZRotation(northRotation, Math.PI / 8.);

		// let cesiumMatrixGl = new Float64Array(cesiumMatrix);
		// mat4.multiply(cesiumMatrixGl, cesiumMatrixGl, northRotation);
		// new ThreeDTileLoader({
		// 		url: 'https://www.nederlandin3d.nl/viewer/datasource-data/83812e58-981e-4461-b338-c95aa7212722/tileset.json',
		// 		refLatitude: refLatitude,
		// 		refLongitude: refLongitude,
		// 		callback: (params) => {
		// 				this.bimServerViewer.viewer.geospatialMode = true;
		// 				this.bimServerViewer.loadGltf({
		// 						buffer: params.buffer,
		// 						geospatial: true,
		// 						ignoreMatrix: true,
		// 						Y_UP: true,
		// 						elevation: refElevation,
		// 						refMatrix: cesiumMatrixGl,
		// 				});
		// 		}
		// }).load();

		// Example2: somewhere in Estonia
		// const refLatitude = 59.426735;
		// const refLongitude = 24.740299;
		// const refElevation = 25.;
		// let cesiumMatrix = Transforms.eastNorthUpToFixedFrame(
		// 	Cartesian3.fromDegrees(refLongitude, refLatitude, 0.)
		// );
		// let northRotation = new Float64Array(16);
		// mat4.fromZRotation(northRotation, Math.PI / 8.);
		// let cesiumMatrixGl = new Float64Array(cesiumMatrix);
		// mat4.multiply(cesiumMatrixGl, cesiumMatrixGl, northRotation);
		// new ThreeDTileLoader({
		// 	url: '...',
		// 	refLatitude: refLatitude,
		// 	refLongitude: refLongitude,
		// 	callback: (params) => {
		// 		this.bimServerViewer.viewer.geospatialMode = true;
		// 		this.bimServerViewer.loadGltf({
		// 			buffer: params.buffer,
		// 			geospatial: true,
		// 			ignoreMatrix: true,
		// 			Y_UP: true,
		// 			elevation: refElevation,
		// 			refMatrix: cesiumMatrixGl,
		// 		});
		// 	}
		// }).load();

		this.initializeExtensions(project);
	}

	/**
	 * ! init the extension features for POC
	 */
	initializeExtensions(project) {
		const lastRevisionId = project.lastRevisionId;

		const provider = GlobalProvider.getInstance();

		const issueController = provider.get(IssueController.name);
		issueController.init(document.getElementById('issues-viewer'), lastRevisionId)

		const issueForm = document.getElementById('issues-form');
		issueForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const newIssue = new Issue();
			const issueDescElement = issueForm.querySelector('[name="issue-form-desc"]');
			newIssue.description = issueDescElement?.value;

			issueController.handleCreateIssue(newIssue);

			issueDescElement.value = '';
		})

	}
}

new App().start();
