const express = require('express')
const morgan = require('morgan')
const app = express()

const PORT = 3001

persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
]

const generateId = () => {
	return Math.floor(Math.random() * 10 ** 12)
}

app.use(express.json())
app.use(
	morgan((tokens, req, res) => {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'),
			'-',
			tokens['response-time'](req, res),
			'ms',
			JSON.stringify(req.body),
		].join(' ')
	})
)

app.get('/', (req, res) => {
	res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	const person = persons.find((person) => person.id === id)

	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	persons = persons.filter((person) => person.id !== id)

	res.status(204).end()
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.post('/api/persons', (req, res) => {
	const body = req.body

	if (!body.name || !body.number) {
		return res.status(300).json({
			error: 'name or number missing',
		})
	}

	if (persons.find((person) => person.name === body.name)) {
		return res.status(300).json({
			error: 'name must be unique',
		})
	}

	const person = {
		name: body.name,
		number: body.number,
		id: generateId(),
	}

	persons.concat(person)

	res.json(person)
})

app.get('/info', (req, res) => {
	res.send(
		`<div>Phonebook has info for ${
			persons.length
		} people</div><div>${new Date().toString()}</div>`
	)
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})