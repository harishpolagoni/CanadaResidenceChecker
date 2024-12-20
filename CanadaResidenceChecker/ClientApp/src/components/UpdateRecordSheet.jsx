import React, { useState, useEffect } from 'react';
function UpdateRecordSheet({ resident, travelDate, onUpdate, formatDate, onClose }) {

    const [oldTravelDate, setOldTravelDate] = useState(null); // Store the original travel date
    const [exitDate, setDateOfExit] = useState('');
    const [entryDate, setDateOfEntry] = useState('');
    const [message, setMessage] = useState(''); // For status messages

    useEffect(() => {
        if (travelDate) {
            setOldTravelDate(travelDate); // Store the original travel date
            setDateOfEntry(formatDate(travelDate.dateOfEntry)); // Format date to YYYY-MM-DD
            setDateOfExit(formatDate(travelDate.dateOfExit));   // Format date to YYYY-MM-DD
        }
    }, [travelDate]);


    const handleUpdate = async () => {
        if (!resident || !entryDate) {
            setMessage('Please provide entry date');
            return;
        }
        const updatedTravelDate = {
            dateOfEntry: formatDate(entryDate),
            dateOfExit: (exitDate === '' || exitDate === 'N/A') ? null : formatDate(exitDate),
        };
        // Ensure old travel date exists before updating
        if (!oldTravelDate) {
            setMessage('No travel date selected to update.');
            return;
        }
        try {
            const response = await fetch('recordsheet/updateRecord/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: resident.name,
                    oldTravelDates: {
                        dateOfEntry: formatDate(oldTravelDate.dateOfEntry),
                        dateOfExit: oldTravelDate.dateOfExit ? formatDate(oldTravelDate.dateOfExit) : null,
                    },
                    newTravelDates: updatedTravelDate,
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const updatedTotalDays = responseData.totalNumberOfDays;
                setMessage('Record updated successfully!');
                setDateOfEntry(updatedTravelDate.dateOfEntry);
                setDateOfExit(updatedTravelDate.dateOfExit);
                // Call the parent's update function
                onUpdate(resident.name, oldTravelDate, updatedTravelDate, updatedTotalDays);
            } else {
                const errorResponse = await response.json();
                setMessage(`Failed to update record: ${errorResponse.message}`);
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
                Update Travel Record for {resident.name}
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
                <button className="update-button" onClick={handleUpdate}>
                    Update
                </button>
            </div>
            {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
        </div>);
}
export default UpdateRecordSheet;