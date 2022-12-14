require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.static('build'))
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

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).end()
			}
		})
		.catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).end()
		})
		.catch((error) => next(error))
})

app.get('/api/persons', (req, res) => {
	Person.find({}).then((result) => {
		res.json(result)
	})
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, {
		new: true,
		runValidators: true,
		context: 'query',
	})
		.then((updatedNote) => {
			res.json(updatedNote)
		})
		.catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson)
		})
		.catch((error) => next(error))
})

app.get('/info', (req, res) => {
	let personsLength = 0
	Person.find({}).then((result) => {
		personsLength = result.length
	})
	res.send(
		`<div>Phonebook has info for ${personsLength} people</div><div>${new Date().toString()}</div>`
	)
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.error(error.message)
	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	} else if (error.code === 11000) {
		return res
			.status(400)
			.json({ error: `Name ${error.keyValue.name} already exists` })
	}
	next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
