/**
 * ! The fake service provider based on the class name, for POC only so it's Singleton (凸 ಠ 益 ಠ) 凸
 */
export default class GlobalProvider {
	static _singletonContainer;

	/**
	 * Get singleton instance of GlobalProvider
	 * @returns {GlobalProvider} 
	 */
	static getInstance() {
		if (!this._singletonContainer) {
			this._singletonContainer = new GlobalProvider();
		}
		return this._singletonContainer;
	}

	/**
	 * store the registered objects with their name
	 *
	 * @access private
	 * @type {Map<string, Object>}
	 */
	_objectContainer;

	constructor() {
		this._objectContainer = {};
	}

	/**
	 * Get registered object from the provider
	 *
	 * @param {string} objName
	 *
	 * @return {Object} the registered object
	 */
	get(objName) {
		return this._objectContainer[objName];
	}

	/**
	 * Register the objects with provider
	 *
	 * @param {string} objName
	 * @param {Object} obj
	 */
	register(objName, obj) {
		this._objectContainer[objName] = obj;
	}
}
