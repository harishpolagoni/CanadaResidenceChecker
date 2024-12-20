import React, { useState } from 'react';
function AddTravelRecord({ resident, onAddTravelRecord, formatDate, onClose }) {
    const [exitDate, setDateOfExit] = useState('');
    const [entryDate, setDateOfEntry] = useState('');
    const [message, setMessage] = useState(''); // For status messages
    const handleAdd = async () => {
        if (!resident || !entryDate) {
            setMessage('Please provide entry date.');
            return;
        }
        // Check if a travel date with the old entry and exit dates exist
        const existingIndex = resident.travelDates.findIndex(
            (travelDate) => formatDate(travelDate.dateOfEntry) === formatDate(entryDate) ||
                formatDate(travelDate.dateOfExit) === formatDate(exitDate)

        );
        if (existingIndex !== -1) {
            // there is an existing travel date with the same entry or exit date
            setMessage('There is an existing travel record with the same entry or exit dates. Please provide new dates.');
            return;
        }
        const travelDate = {
            dateOfEntry: formatDate(entryDate),
            dateOfExit: (exitDate === '' || exitDate === 'N/A') ? null : formatDate(exitDate),
        };

        try {
            const response = await fetch('recordsheet/updateRecord/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: resident.name,
                    oldTravelDates: {
                        dateOfEntry: null,
                        dateOfExit: null,
                    },
                    newTravelDates: travelDate,
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const updatedTotalDays = responseData.totalNumberOfDays;
                setMessage('Record added successfully!');
                setDateOfEntry(travelDate.dateOfEntry);
                setDateOfExit(travelDate.dateOfExit);
                // Call the parent's add function
                onAddTravelRecord(resident.name, travelDate, updatedTotalDays);
            } else {
                const errorResponse = await response.json();
                setMessage(`Failed to add record: ${errorResponse.message}`);
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
            <h6 className="form-title">
                Add Travel Record for {resident.name}
            </h6>
            <div className="form-group">
                <label htmlFor="dateOfEntry">Date of Entry :</label>
                <input
                    type="date"
                    id="dateOfEntry"
                    value={entryDate}
                    onChange={(e) => setDateOfEntry(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="dateOfExit">Date of Exit :</label>
                <input
                    type="date"
                    id="dateOfExit"
                    value={exitDate}
                    onChange={(e) => setDateOfExit(e.target.value)}
                />
            </div>
            <div className="form-group">
                <button className="update-button" onClick={handleAdd}>
                    Add
                </button>
            </div>
            {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
        </div>);
}
export default AddTravelRecord;