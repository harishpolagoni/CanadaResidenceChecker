namespace CanadaResidenceChecker.Models
{
    public class UpdateRecordRequest
    {
        public string Name { get; set; } = string.Empty;
        public TravelDates? NewTravelDates { get; set; }
        public TravelDates? OldTravelDates { get; set; }
    }
}
