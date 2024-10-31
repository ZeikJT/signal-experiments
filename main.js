import {createDOM, createComponent, createFragment} from '/dom/dom.js'
import {createSignal, reaction} from "/signals/signals.js"

const [randomSignal, randomSignalSetter] = createSignal(0)
setInterval(() => randomSignalSetter(0), 100)
const [signal1, signal1Setter] = createSignal('red')
const [signal2, signal2Setter] = createSignal('')
const [signal3, signal3Setter] = createSignal([])

const clickLog = {'on:click': (event) => console.log('clicked', event)}

document.body.appendChild(
	createDOM('div', {
			'style': () => {
				const colorValue = signal1()
				return colorValue ? 'color:' + colorValue : null
			},
		},
		createDOM('span', {...clickLog},
			() => {
				const value = signal2()
				return (value ? value :
					createFragment(
						createDOM('table', null,
							createDOM('tr', null,
								...['cell!', 'other cell'].map((text) => createDOM('td', null, text))
							)
						)
					)
				)
			}
		),
		() => createFragment(...signal3().map((text) => createDOM('div', null, text))),
		createComponent(SlowLoad, {nextWait: () => (Math.random() * 3000) + 300},
			() => createDOM('div', null, 'text'),
			() => createDOM('div', {'style': 'font-family:monospace'}, () => {
				randomSignal()
				return 'some scrambled text'.split('').map(() => String.fromCharCode((Math.random() * 26) + 65)).join('')
			}),
			...'hello world this text loads slowly'.split(' ').map((t) => ' ' + t),
		)
	)
)

setTimeout(() => signal2Setter('world'), 1000)
setTimeout(() => (signal2Setter('what??'),signal3Setter(['hello', 'world'])), 2000)
setTimeout(() => signal1Setter(''), 3000)
setTimeout(() => (signal2Setter(''),signal3Setter([])), 4000)
setTimeout(() => (signal2Setter('hello'),signal3Setter(['last one', createDOM('div', null, 'text here')])), 5000)

function SlowLoad({nextWait = () => 1000} = {}, children) {
	let i = 0
	const [signalArray, signalArraySetter] = createSignal([])
	function showNext() {
		signalArraySetter(children.slice(0, i).map((node) => node instanceof Function ? node() : node))
		if (++i <= children.length) {
			setTimeout(showNext, nextWait())
		}
	}
	showNext()
	return () => createFragment(...signalArray())
}
