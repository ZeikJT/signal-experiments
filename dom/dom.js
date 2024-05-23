import {dom} from '/signals/signals.js'

export function createFragment(...children) {
	const fragment = document.createDocumentFragment()
	if (children.length) {
		fragment.append(...children)
	}
	return fragment
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
						elem.setAttribute(attribute, value())
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
					const typeOfSignalValue = typeof signalValue
					const newChildNode = typeOfSignalValue === 'object' ? signalValue : document.createTextNode(signalValue)
					if (childNodes.length > 1) {
						for (const child of childNodes.slice(1)) {
							elem.removeChild(child)
						}
						childNodes.length = 1
					}
					if (newChildNode instanceof DocumentFragment) {
						const existingNode = childNodes[0]
						childNodes.length = 0
						if (newChildNode.childNodes.length) {
							childNodes.push(...newChildNode.childNodes)
							elem.replaceChild(newChildNode, existingNode)
						} else {
							const placeholder = document.createComment('placeholder')
							childNodes.push(placeholder)
							elem.replaceChild(placeholder, existingNode)
						}
					} else {
						elem.replaceChild(newChildNode, childNodes[0])
						childNodes[0] = newChildNode
					}
				})
			} else {
				elem.appendChild(typeOfChild === 'object' ? child : document.createTextNode(child))
			}
		}
	}
	return elem
}
