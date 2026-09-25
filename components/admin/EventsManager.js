'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, Clock, Image as ImageIcon, Star, Loader2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

export default function EventsManager({ barId }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        description: '',
        image: '',
        featured: false,
    })

    useEffect(() => {
        fetchEvents()
    }, [barId])

    const fetchEvents = async () => {
        try {
            const response = await fetch(`/api/admin/events?barId=${barId}`)
            const data = await response.json()
            if (data.success) {
                setEvents(data.events)
            }
        } catch (error) {
            console.error('Failed to fetch events:', error)
            toast.error('Failed to load events')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        try {
            const response = await fetch('/api/admin/events/upload', {
                method: 'POST',
                body: uploadFormData,
            })
            const data = await response.json()

            if (data.success) {
                setFormData({ ...formData, image: data.url })
                toast.success('Image uploaded')
            } else {
                toast.error('Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.date) {
            toast.error('Title and Date are required')
            return
        }

        setSubmitting(true)
        try {
            const url = editingEvent
                ? `/api/admin/events/${editingEvent.id}`
                : '/api/admin/events'

            const method = editingEvent ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    barId,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success(editingEvent ? 'Event updated' : 'Event created')
                fetchEvents()
                handleLocalReset()
            } else {
                toast.error(data.error || 'Operation failed')
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Failed to save event')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        try {
            const response = await fetch(`/api/admin/events/${id}?barId=${barId}`, {
                method: 'DELETE',
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Event deleted')
                setEvents(events.filter(e => e.id !== id))
            } else {
                toast.error('Failed to delete')
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete event')
        }
    }

    const handleEdit = (event) => {
        setEditingEvent(event)
        setFormData({
            title: event.title,
            date: event.date?.split('T')[0] || '',
            time: event.time || '',
            description: event.description || '',
            image: event.image || '',
            featured: event.featured || false,
        })
        setShowForm(true)
    }

    const handleLocalReset = () => {
        setFormData({
            title: '',
            date: '',
            time: '',
            description: '',
            image: '',
            featured: false,
        })
        setEditingEvent(null)
        setShowForm(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-text" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Add Event
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {editingEvent ? 'Edit Event' : 'New Event'}
                        </h3>
                        <button onClick={handleLocalReset} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center space-x-2 mt-8">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={formData.featured}
                                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                    className="rounded border-gray-300 text-primary-text focus:ring-primary"
                                />
                                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Feature this event (show on homepage)
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                            <div className="flex items-center gap-4">
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded" />
                                )}
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <Upload className="w-4 h-4" />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={handleLocalReset}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group">
                        <div className="relative h-48">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                            {event.featured && (
                                <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full shadow-md">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(event.date)}
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {event.time}
                                    </div>
                                )}
                            </div>
                            {event.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{event.description}</p>
                            )}
                        </div>
                    </div>
                ))}
                {events.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No upcoming events</p>
                        <button onClick={() => setShowForm(true)} className="text-primary-text hover:underline mt-2">
                            Create your first event
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
