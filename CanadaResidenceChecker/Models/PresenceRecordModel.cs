
namespace CanadaResidenceChecker.Models
{
    public class ResidenceRecord
    {
        public string Name { get; set; } = string.Empty;
        public int TotalNumberOfDays { get; set; }
        public List<TravelDates> TravelDates { get; set; } = new();
    }
    public class ResidenceData
    {
        public List<ResidenceRecord> ResidenceRecords { get; set; } = new();
    }
}
