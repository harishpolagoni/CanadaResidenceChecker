using CANApp.DAL.Interface;
using CANApp.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CANApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RecordSheetController: ControllerBase
    {
        private readonly IResidentsRepository _repository;

        public RecordSheetController(IResidentsRepository repository)
        {
            _repository = repository;
        }
        private string dbFilePath = "..\\CANApp\\Db\\ResidenceRecord.json";

        [HttpGet]
        [Route("getAllRecords")]
        public async Task<IActionResult> GetAllResidents()
        {
            var residents = await _repository.GetAllResidentsAsync();
            return Ok(residents);
        }

        //[HttpGet]
        //[Route("getAllRecords")]
        //public IActionResult Get()
        //{
        //    try
        //    {
        //        ResidenceData? residenceData;

        //        // Step 1: Read the file safely
        //        using (StreamReader reader = new(dbFilePath))
        //        {
        //            string jsonContent = reader.ReadToEnd();
        //            residenceData = JsonConvert.DeserializeObject<ResidenceData>(jsonContent);
        //            if (residenceData == null)
        //            {
        //                return StatusCode(500, "Error reading residence records");
        //            }
        //            else 
        //            {
        //                residenceData.ResidenceRecords.ForEach(record =>
        //                {
        //                    record.TotalNumberOfDays = CalculateTotalNumberOfDays(record);
        //                });
        //            }                    
        //        }
        //        return Ok(residenceData.ResidenceRecords);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Error reading data: {ex.Message}");
        //    }
        //}

        [HttpPut]
        [Route("updateRecord")]
        public IActionResult UpdateRecord(UpdateRecordRequest updatedRecord)
        {
            try
            {
                if (updatedRecord.NewTravelDates == null)
                {
                    return StatusCode(400, "There are no travel dates provided.");
                }
                if (updatedRecord.OldTravelDates == null)
                {
                    return StatusCode(400, "There are no travel dates provided.");
                }

                ResidenceData? residenceData;
                TravelDates? travelRecord;

                // Step 1: Read the file safely
                using (StreamReader reader = new(dbFilePath))
                {
                    string jsonContent = reader.ReadToEnd();
                    residenceData = JsonConvert.DeserializeObject<ResidenceData>(jsonContent);
                }
                if (residenceData != null)
                {
                    ResidenceRecord? record = residenceData.ResidenceRecords.FirstOrDefault(r => r.Name == updatedRecord.Name);
                    if (record == null)
                    {
                        return NotFound(new { message = "Resident or his/her not found." });
                    }
                    else if (updatedRecord.OldTravelDates.DateOfEntry == null && updatedRecord.OldTravelDates.DateOfExit == null)
                    {
                        // add travel history
                        record.TravelDates.Add(new TravelDates
                        {
                            DateOfEntry = updatedRecord.NewTravelDates.DateOfEntry,
                            DateOfExit = updatedRecord.NewTravelDates.DateOfExit
                        });
                    }
                    else
                    {
                        travelRecord = record.TravelDates.FirstOrDefault(x => x.DateOfEntry == updatedRecord.OldTravelDates.DateOfEntry || x.DateOfExit == updatedRecord.OldTravelDates.DateOfExit);
                        if (travelRecord != null)
                        {
                            // update travel history
                            travelRecord.DateOfEntry = updatedRecord.NewTravelDates.DateOfEntry;
                            travelRecord.DateOfExit = updatedRecord.NewTravelDates.DateOfExit;
                        }
                        else
                        {
                            // add travel history
                            record.TravelDates.Add(new TravelDates
                            {
                                DateOfEntry = updatedRecord.NewTravelDates.DateOfEntry,
                                DateOfExit = updatedRecord.NewTravelDates.DateOfExit
                            });
                        }
                    }

                    record.TotalNumberOfDays = CalculateTotalNumberOfDays(record);
                    UpdateResidentRecord(residenceData);

                    return Ok(new
                    {
                        message = "Residence record updated successfully",
                        totalNumberOfDays = record.TotalNumberOfDays
                    });
                }
                else
                {
                    return StatusCode(500, "Error reading residents records");
                }
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating residence record: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("addResident")]
        public IActionResult AddResident([FromBody] ResidenceRecord newRecord)
        {
            try
            {
                ResidenceData? residenceData;

                // Read the existing records
                using (StreamReader reader = new(dbFilePath))
                {
                    string jsonContent = reader.ReadToEnd();
                    residenceData = JsonConvert.DeserializeObject<ResidenceData>(jsonContent);
                }
                if (residenceData == null)
                {
                    return StatusCode(500, "Error reading residence records");
                }
                else 
                {
                    // Add the new resident record
                    residenceData.ResidenceRecords.Add(newRecord);
                    newRecord.TotalNumberOfDays = CalculateTotalNumberOfDays(newRecord);
                    UpdateResidentRecord(residenceData);

                    // Return the new record including the calculated total days
                    return Ok(newRecord);
                }
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding resident: {ex.Message}");
            }
        }

        [HttpDelete]
        [Route("deleteTravelRecord")]
        public IActionResult DeleteTravelRecord([FromBody] DeleteTravelRecordRequest request)
        {
            try
            {
                ResidenceData? residenceData;

                // Step 1: Read the file safely
                using (StreamReader reader = new(dbFilePath))
                {
                    string jsonContent = reader.ReadToEnd();
                    residenceData = JsonConvert.DeserializeObject<ResidenceData>(jsonContent);
                }
                if (residenceData == null)
                {
                    return StatusCode(500, "Error reading residence records");
                }
                else
                {
                    // Step 2: Find the resident
                    ResidenceRecord? record = residenceData.ResidenceRecords.FirstOrDefault(r => r.Name == request.Name);
                    if (record == null)
                    {
                        return NotFound(new { message = "Resident not found." });
                    }

                    // Step 3: Find the travel date to delete
                    TravelDates? travelRecord = record.TravelDates.FirstOrDefault(t =>
                        t.DateOfEntry == request.TravelDates.DateOfEntry &&
                        (t.DateOfExit == request.TravelDates.DateOfExit || request.TravelDates.DateOfExit == null));

                    if (travelRecord == null)
                    {
                        return NotFound(new { message = "Travel date not found." });
                    }

                    // Step 4: Remove the travel date
                    record.TravelDates.Remove(travelRecord);

                    // Step 5: Update the total number of residence days
                    record.TotalNumberOfDays = CalculateTotalNumberOfDays(record);

                    // Step 6: Save the updated data back to the file
                    UpdateResidentRecord(residenceData);

                    return Ok(new { message = "Travel date deleted successfully.", totalNumberOfDays = record.TotalNumberOfDays });
                }               
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting travel date: {ex.Message}");
            }
        }
        private void UpdateResidentRecord(ResidenceData residenceData)
        {
            try
            {
                // Serialize back to the JSON file
                using (var writer = new StreamWriter(dbFilePath, false))
                {
                    var updatedJson = JsonConvert.SerializeObject(residenceData, Formatting.Indented);
                    writer.Write(updatedJson);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating residence record: {ex.Message}");
            }           
        }
        private int CalculateTotalNumberOfDays(ResidenceRecord record)
        {
            int totalNumberOfDays = 0;
            foreach (TravelDates travelRecord in record.TravelDates)
            {
                if (travelRecord.DateOfEntry == null)
                {
                    return 0;
                }
                if (travelRecord.DateOfExit == null)
                {
                    totalNumberOfDays += (DateTime.Now - travelRecord.DateOfEntry.Value).Days;
                }
                else
                {
                    totalNumberOfDays += (travelRecord.DateOfExit.Value - travelRecord.DateOfEntry.Value).Days;
                }
            }
            return totalNumberOfDays;
        }
    }
}
