using CANApp.DAL.Interface;
using CANApp.Models;
using MongoDB.Driver;

namespace CANApp.DAL
{
    public class ResidentsRepository : IResidentsRepository
    {
        private readonly IMongoCollection<Resident> _residentsCollection;

        public ResidentsRepository(IMongoDatabase database)
        {
            _residentsCollection = database.GetCollection<Resident>("residents_travel_history");
        }

        public async Task<List<Resident>> GetAllResidentsAsync()
        {
            try
            {
                return await _residentsCollection.Find(FilterDefinition<Resident>.Empty).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving residents", ex);
            }
            
        }

        public async Task AddResidentAsync(Resident resident)
        {
            await _residentsCollection.InsertOneAsync(resident);
        }
    }
}
