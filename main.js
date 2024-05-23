import {createDOM, createFragment} from '/dom/dom.js'
import {createSignal, reaction} from "/signals/signals.js"

const [signal1, signal1Setter] = createSignal('red')
const [signal2, signal2Setter] = createSignal('')
const [signal3, signal3Setter] = createSignal([])

const clickLog = {'on:click': (event) => console.log('clicked', event)}

document.body.appendChild(
	createDOM('div', {'style': () => 'color:' + signal1()},
		createDOM('span', {...clickLog},
			() => {
				const value = signal2()
				return value ? value :
					createFragment(
						createDOM('table', null,
							createDOM('tr', null,
								...['cell!', 'other cell'].map((text) => createDOM('td', null, text))
							)
						)
					)
			}
		),
		() => createFragment(...signal3().map((text) => createDOM('div', null, text))),
	)
)

setTimeout(() => signal2Setter('world'), 1000)
setTimeout(() => (signal2Setter('what??'),signal3Setter(['hello', 'world'])), 2000)
setTimeout(() => signal1Setter('black'), 3000)
setTimeout(() => (signal2Setter(''),signal3Setter([])), 4000)
setTimeout(() => (signal2Setter('hello'),signal3Setter(['last one'])), 5000)
