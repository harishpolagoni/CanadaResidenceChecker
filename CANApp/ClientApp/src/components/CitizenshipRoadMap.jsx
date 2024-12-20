import React, { useState, useEffect } from 'react';
import flag from '../images/Flag_of_Canada.png';
import UpdateRecordSheet from './UpdateRecordSheet';
import AddNewResident from './AddNewResident';
import AddTravelRecord from './AddTravelRecord';
function CitizenshipRoadMap() {
    const [recordSheet, setRecordSheet] = useState([]);
    const [selectedResident, setSelectedResident] = useState(null); // Track the selected resident
    const [selectedTravelDate, setSelectedTravelDate] = useState(null); // Track the selected travel date
    const [isAddingNewResident, setIsAddingNewResident] = useState(false); // Flag for adding a new resident

    useEffect(() => {
        fetch('recordsheet/getAllRecords/')
            .then(response => response.json())
            .then(data => setRecordSheet(data));
    }, []);

    // Function to update a resident's travel dates
    const updateTravelDates = (residentName, oldTravelDate, newTravelDate, totalNumberOfDays) => {
        setRecordSheet((prevRecordSheet) => {
            const updatedSheet = prevRecordSheet.map((record) => {
                if (record.name === residentName) {
                    const existingIndex = record.travelDates.findIndex(
                        (travelDate) =>
                            formatDate(travelDate.dateOfEntry) === formatDate(oldTravelDate.dateOfEntry) &&
                            formatDate(travelDate.dateOfExit) === formatDate(oldTravelDate.dateOfExit)
                    );

                    let updatedTravelDates;
                    if (existingIndex !== -1) {
                        updatedTravelDates = [...record.travelDates];
                        updatedTravelDates[existingIndex] = newTravelDate;
                    } else {
                        updatedTravelDates = [...record.travelDates, newTravelDate];
                    }
                    return {
                        ...record,
                        travelDates: updatedTravelDates,
                        totalNumberOfDays,
                    };
                }
                return record;
            });

            // Find the updated resident
            const updatedResident = updatedSheet.find((record) => record.name === residentName);
            setSelectedResident(updatedResident); // Update selected resident
            return updatedSheet;
        });
    };

    // Function to add new travel dates for a resident
    const AddTravelDates = (residentName, newTravelDate, totalNumberOfDays) => {
        setRecordSheet((prevRecordSheet) => {
            const updatedSheet = prevRecordSheet.map((record) => {
                if (record.name === residentName) {
                    return {
                        ...record,
                        travelDates: [...record.travelDates, newTravelDate],
                        totalNumberOfDays,
                    };
                }
                return record;
            });

            // Find the updated resident
            const updatedResident = updatedSheet.find((record) => record.name === residentName);
            setSelectedResident(updatedResident); // Update selected resident
            return updatedSheet;
        });
    };

    const addNewResident = (residentName, travelDates, totalNumberOfDays) => {
        const newResident = {
            name: residentName,
            travelDates,
            totalNumberOfDays,
        };
        setRecordSheet([...recordSheet, newResident]);
    };
    const deleteTravelDate = async (residentName, travelDate) => {
        try
        {
            // Call the backend to delete the travel date
            const response = await fetch('recordsheet/deleteTravelRecord/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: residentName,
                    travelDates: {
                        dateOfEntry: formatDate(travelDate.dateOfEntry),
                        dateOfExit: travelDate.dateOfExit ? formatDate(travelDate.dateOfExit) : null,
                    },
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const updatedTotalDays = responseData.totalNumberOfDays;
                setRecordSheet((prevRecordSheet) =>
                    prevRecordSheet.map((record) => {
                        if (record.name === residentName) {
                            const updatedTravelDates = record.travelDates.filter(
                                (t) =>
                                    formatDate(t.dateOfEntry) !== formatDate(travelDate.dateOfEntry) ||
                                    formatDate(t.dateOfExit) !== formatDate(travelDate.dateOfExit)
                            );
                            return {
                                ...record,
                                travelDates: updatedTravelDates,
                                totalNumberOfDays: updatedTotalDays,
                            };
                        }
                        return record;
                    })
                );
            } else {
                const errorResponse = await response.json();
                console.error(`Failed to delete travel date: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    };


    // Function to format the date as 'yyyy-MM-dd' if it's a valid date
    const formatDate = (date) => {
        if (date) {
            const formattedDate = new Date(date);
            return formattedDate.toISOString().split('T')[0]; // Extracts the date part
        }
        return 'N/A';
    };
    const closeUpdateForm = () => {
        setSelectedResident(null);
        setSelectedTravelDate(null);
    };
    const closeAddResidentForm = () => {
        setIsAddingNewResident(null);
    };
    return (
        <div>
            <div className="header-container">
                <img src={flag} alt="Flag" width="100px"></img>
                <h2>Canada Residence Record Sheet</h2>
            </div>
            <br />
            
            <div className="table-container">
                {(recordSheet.length > 0) ? (
                    <table className="residence-table">
                        <thead>
                            <tr>
                                <th>Resident Name</th>
                                <th>Total Days of Residence</th>
                                <th>Travel Dates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordSheet.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.name}</td>
                                    <td>{record.totalNumberOfDays}</td>
                                    <td>
                                        <ul>
                                            {record.travelDates.map((travel, i) => (
                                                <li key={i}>
                                                    <span className="date-label">Entry:</span> {formatDate(travel.dateOfEntry)}
                                                    <span className="date-separator"/>
                                                    <span className="date-label">Exit:</span> {formatDate(travel.dateOfExit)}
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => {
                                                            setSelectedResident(record);
                                                            setSelectedTravelDate(travel);
                                                            setIsAddingNewResident(false);
                                                        }}
                                                    >
                                                        🖉
                                                    </button>
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => deleteTravelDate(record.name, travel)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className="add-travel-button"
                                            onClick={() => {
                                                setSelectedResident(record);
                                                setSelectedTravelDate(null);
                                                setIsAddingNewResident(false);
                                            }}
                                        >
                                            ➕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <div>loading...</div>}
            </div>
            <br />
            <div className="add-resident-container">
            <button
                className="add-resident-button"
                onClick={() => {
                    setSelectedResident(null);
                    setSelectedTravelDate(null);
                    setIsAddingNewResident(true);
                }}>
                ➕ Add Resident
                </button>
            </div>
            <br/>
            {selectedTravelDate && (
                <UpdateRecordSheet
                    resident={selectedResident}
                    travelDate={selectedTravelDate}
                    onUpdate={updateTravelDates}
                    formatDate={formatDate}
                    onClose={closeUpdateForm}
                />
            )} 
            {isAddingNewResident && (
                <AddNewResident
                    onAdd={addNewResident}
                    formatDate={formatDate}
                    recordSheet={recordSheet}
                    onClose={closeAddResidentForm}
                />
            )}
            {selectedResident && (
                <AddTravelRecord
                    resident={selectedResident}
                    onAddTravelRecord={AddTravelDates}
                    formatDate={formatDate}
                    onClose={closeUpdateForm}
                />
            )}
        </div>
    );
}
export default CitizenshipRoadMap;