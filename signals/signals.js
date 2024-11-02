let reactionContext = []
const REACTION_CONTEXT_REACTION = {}
const REACTION_CONTEXT_DOM = {}
const REACTION_CONTEXT_UNTRACKED_READ = {}

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

export function untrackedRead(fn) {
	reactionContext.push({context: REACTION_CONTEXT_UNTRACKED_READ, fn})
	const value = fn.call()
	reactionContext.pop()
	return value
}

export const signalMap = new Map()

export function createSignal(defaultValue) {
	let value = defaultValue
	const subscribers = new Set
	const typeOfValue = getTypeOf(value)
	return [
		function readSignal() {
			if (reactionContext.length === 0) {
				throw new Error('Reading signal outside of proper context.')
			}
			const context = reactionContext[reactionContext.length - 1]
			if (context.context !== REACTION_CONTEXT_UNTRACKED_READ) {
				subscribers.add(context)
			}
			return value
		},
		function setSignal(newValue) {
			const typeOfNewValue = getTypeOf(newValue)
			if (typeOfValue !== typeOfNewValue) {
				throw new Error(`Attempted to update <${value}> which is of type "${typeOfValue}" with <${newValue}> which is of type "${typeOfNewValue}"`)
			}
			const changed = value !== newValue
			value = newValue
			if (changed) {
				for (const subscriber of subscribers) {
					reactionContext.push(subscriber)
					subscriber.fn()
					reactionContext.pop()
				}
			}
		}
	]
}
