function GamepadControls(scene, camera, gamepadChangeFunction) {
	this.activeGamepads = 0;
	this.callback = gamepadChangeFunction;
	this.lastGamepads = [];
}
GamepadControls.prototype = {
	constructor: GamepadControls,
	getGamepads: function() {
		var a = navigator.getGamepads();
		return [a[0], a[1]];
	},
	update: function() {
		let nowGamepads = this.getGamepads();
		let lastGamepads = this.lastGamepads;
		this.activeGamepads = lastGamepads.length;
		nowGamepads.forEach((obj,i)=>{
			if (obj && obj.id && (obj.id.toLowerCase().indexOf("xbox 360") !== -1)) {
				//this.activeGamepads[i] = i.toString();
				let lastGamepad = lastGamepads[i];
				obj.buttons.forEach((btn,j)=>{
					if (btn.value !== 0 && btn.value !== 1 && ((lastGamepad && lastGamepad.buttons[j] && btn.value !== lastGamepad.buttons[j].value && btn.value !== 0 && btn.value !== 1) || (!lastGamepad)))
						this.callback.call(window, {
							type: "button-dial",
							id: i,
							key: j,
							value: btn.value,
							timestamp: nowGamepads[i].timestamp
						});
					if ((lastGamepad && lastGamepad.buttons[j] && btn.pressed !== lastGamepad.buttons[j].pressed) || (!lastGamepad && btn.pressed))
						this.callback.call(window, {
							type: btn.pressed ? "button-push" : "button-release",
							id: i,
							key: j,
							value: btn.pressed ? 1 : 0,
							timestamp: nowGamepads[i].timestamp
						});
				}
				)
				obj.axes.forEach((axis, j)=>{
					if (lastGamepad && lastGamepad.axes[j] != axis) {
						this.callback.call(window, {
							type: "axis-change",
							id: i,
							key: j,
							value: axis,
							timestamp: nowGamepads[i].timestamp
						});
					}
				}
				);
			}
			this.lastGamepads = [];
			nowGamepads.forEach((obj,i)=>{
				if (obj) {
					let toAdd = {
						id: obj.id,
						buttons: [],
						axes: [],
					};
					obj.buttons.forEach((btn,j)=>{
						toAdd.buttons.push({
							pressed: btn.pressed,
							value: btn.value
						});
					}
					);
					obj.axes.forEach((axis,j)=>{
						toAdd.axes.push(axis);
					}
					);
					this.lastGamepads.push(toAdd);
				} else {
					this.lastGamepads.push(undefined);
				}
			}
			);
		}
		);
	}
}
