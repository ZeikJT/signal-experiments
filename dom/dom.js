import {dom} from '/signals/signals.js'

export function createFragment(...children) {
	const fragment = document.createDocumentFragment()
	if (children.length) {
		fragment.append(...children)
	}
	return fragment
}

const elementsToCleanupMapping = new Map
const componentStack = []

export function onRemovedFromDOM(callback) {
	if (!componentStack.length) {
		throw new Error('No components being created to attach onRemovedFromDOM to.')
	}
	componentStack[componentStack.length - 1].push(callback)
}

export function createComponent(componentFn, props, ...children) {
	const removedFromDOMListeners = []
	componentStack.push(removedFromDOMListeners)
	const returnValue = componentFn(props, children.slice())
	componentStack.pop()

	return returnValue
}

export function createDOM(tagName, attributes, ...children) {
	const elem = document.createElement(tagName)
	if (attributes) {
		for (const [attribute, value] of Object.entries(attributes)) {
			if (typeof value === 'function') {
				if (attribute.startsWith('on:')) {
					elem.addEventListener(attribute.substring(3), value)
				} else {
					dom(() => {
						const computed = value()
						if (computed == null) {
							elem.removeAttribute(attribute)
						} else {
							elem.setAttribute(attribute, computed)
						}
					})
				}
			} else {
				elem.setAttribute(attribute, value)
			}
		}
	}
	if (children.length) {
		for (const child of children) {
			const typeOfChild = typeof child
			if (typeOfChild === 'function') {
				let childNodes = [document.createTextNode('')]
				elem.appendChild(childNodes[0])
				dom(() => {
					const signalValue = child()
					if (childNodes.length > 1) {
						for (const child of childNodes.slice(1)) {
							elem.removeChild(child)
						}
						childNodes.length = 1
					}
					if (signalValue instanceof DocumentFragment) {
						const existingNode = childNodes[0]
						childNodes.length = 0
						if (signalValue.childNodes.length) {
							childNodes.push(...signalValue.childNodes)
							elem.replaceChild(signalValue, existingNode)
						} else {
							const placeholder = document.createComment('placeholder')
							childNodes.push(placeholder)
							elem.replaceChild(placeholder, existingNode)
						}
					} else if (signalValue instanceof Element) {
						elem.replaceChild(signalValue, childNodes[0])
						childNodes[0] = signalValue
					} else if (elem.childNodes.length === 1 && elem.childNodes[0].nodeType === Node.TEXT_NODE) {
						elem.childNodes[0].nodeValue = signalValue
					} else {
						elem.replaceChild(document.createTextNode(signalValue), childNodes[0])
						childNodes[0] = elem.childNodes[0]
					}
				})
			} else {
				elem.appendChild(typeOfChild === 'object' ? child : document.createTextNode(child))
			}
		}
	}
	return elem
}
