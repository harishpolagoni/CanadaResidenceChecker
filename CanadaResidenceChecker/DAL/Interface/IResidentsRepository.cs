using CanadaResidenceChecker.Models;

namespace CanadaResidenceChecker.DAL.Interface
{
    public interface IResidentsRepository
    {
        Task<List<Resident>> GetAllResidentsAsync();
        Task AddResidentAsync(Resident resident);
    }
}
