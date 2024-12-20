import React, { useState } from 'react';
function AddNewResident({ onAdd, formatDate, recordSheet, onClose }) {
    const [residentName, setResidentName] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [exitDate, setExitDate] = useState('');
    const [message, setMessage] = useState('');

    const handleAdd = async () => {
        if (!residentName || !entryDate) {
            setMessage('Please provide resident name and entry date.');
            return;
        }
        // Check if the resident name already exists in the recordSheet
        const residentExists = recordSheet.some((record) => record.name.toLowerCase() === residentName.toLowerCase());

        if (residentExists) {
            setMessage('A resident with this name already exists.');
            return;
        }
        const newTravelDates = [
            {
                dateOfEntry: formatDate(entryDate),
                dateOfExit: exitDate ? formatDate(exitDate) : null,
            },
        ];

        try {
            const response = await fetch('recordsheet/addResident/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: residentName,
                    travelDates: newTravelDates,
                }),
            });

            if (response.ok) {
                const addedResident = await response.json();
                onAdd(addedResident.name, addedResident.travelDates, addedResident.totalNumberOfDays);
                setMessage('New resident added successfully!');
                // Clear input fields
                setResidentName('');
                setEntryDate('');
                setExitDate('');
            } else {
                const errorResponse = await response.json();
                setMessage(`Failed to add resident: ${errorResponse.message}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="update-record-container">
            <div className="close-button-container">
                <button className="close-button" onClick={onClose}>
                    <span className="close-icon">×</span>
                </button>
            </div>
            <h4 className="form-title">Add New Resident</h4>
            <div className="form-group">
                <label htmlFor="residentName">Resident Name:</label>
                <input
                    type="text"
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="dateOfEntry">Date of Entry:</label>
                <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="dateOfExit">Date of Exit:</label>
                <input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                />
            </div>
            <button className="update-button" onClick={handleAdd}>
                Add
            </button>
            {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );
}
export default AddNewResident;