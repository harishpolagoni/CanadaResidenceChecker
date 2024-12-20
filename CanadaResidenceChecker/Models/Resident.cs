using MongoDB.Bson;

namespace CanadaResidenceChecker.Models
{
    public class Resident
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalNumberOfDays { get; set; }
        public List<TravelDate> TravelDates { get; set; } = new();
    }
}
