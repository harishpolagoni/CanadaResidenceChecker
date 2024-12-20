using CANApp.Models;

namespace CANApp.DAL.Interface
{
    public interface IResidentsRepository
    {
        Task<List<Resident>> GetAllResidentsAsync();
        Task AddResidentAsync(Resident resident);
    }
}
