export function getAllNotes(req, res) {
    return res.status(200).send('you got 20 notes')
}

export function createNote(req, res) {
    return res.status(201).json({ message: 'Note created successfully!' })
}

export function updateNote(req, res) {
    return res.status(200).json({ message: 'Note updated successfully!' })
}

export function deleteNote(req, res) {
    return res.status(200).json({ message: 'Note deleted successfully!' })
}
