let reactionContext = []
const REACTION_CONTEXT_REACTION = {}
const REACTION_CONTEXT_DOM = {}

function getTypeOf(value) {
	const typeOfValue = typeof value
	if (typeOfValue === 'object') {
		if (Array.isArray(value)) {
			return 'array'
		}
		if (value instanceof Map) {
			return 'map'
		}
		if (value instanceof Set) {
			return 'set'
		}
	}
	return typeOfValue
}

function contextualRun(context, fn) {
	reactionContext.push({context, fn})
	fn.call()
	reactionContext.pop()
}
export const reaction = contextualRun.bind(null, REACTION_CONTEXT_REACTION)
export const dom = contextualRun.bind(null, REACTION_CONTEXT_DOM)

export function createSignal(defaultValue) {
	let value = defaultValue
	let subscribers = new Set
	return [
		function readSignal() {
			if (reactionContext.length === 0) {
				throw new Error('Reading signal outside of proper context.')
			}
			const context = reactionContext[reactionContext.length - 1]
			subscribers.add(context)
			return value
		},
		function setSignal(newValue) {
			const typeOfValue = getTypeOf(value)
			const typeOfNewValue = getTypeOf(newValue)
			if (typeOfValue !== typeOfNewValue) {
				throw new Error(`Attempted to update <${value}> which is of type "${typeOfValue}" with <${newValue}> which is of type "${typeOfNewValue}"`)
			}
			value = newValue
			for (const subscriber of subscribers) {
				reactionContext.push(subscriber)
				subscriber.fn()
				reactionContext.pop()
			}
		}
	]
}
