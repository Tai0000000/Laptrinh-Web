import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import AddNewHorseModal from '../../components/HorseOwner/AddNewHorseModal';
import HorseDetailModal from '../../components/HorseOwner/HorseDetailModal';
import ConfirmDeleteModal from '../../components/HorseOwner/ConfirmDeleteModal';
import EditHorseModal from '../../components/HorseOwner/EditHorseModal';
import SuccessModal from '../../components/SuccessModal';

const MyHorses = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [horseToDelete, setHorseToDelete] = useState(null);
  const [horseToEdit, setHorseToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState({ show: false, title: '', msg: '' });

  const fetchHorses = () => {
    setLoading(true);
    api.get(`/owners/${user?.id}/horses`)
      .then((response) => {
        setHorses(response.data.data || response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching horses:', err);
        setError('Failed to fetch horses data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHorses();
    
    // Check if we navigated here from a successful action
    if (location.state?.success) {
      setSuccessMessage({
        show: true,
        title: location.state.title || 'Success!',
        msg: location.state.msg || 'Action completed successfully.'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Horses</h1>
            <p className="text-gray-600 mt-2">Manage your horses collection</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            + Add New Horse
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600 font-semibold">Loading horses...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
        ) : (
          /* Horses Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Breed</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Age</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {horses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No horses found. Add your first horse!
                    </td>
                  </tr>
                ) : (
                  horses.map((horse) => (
                    <tr 
                      key={horse.id} 
                      onClick={() => setSelectedHorse(horse)}
                      className="border-b hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">{horse.name}</td>
                      <td className="px-6 py-4 text-gray-700">{horse.breed}</td>
                      <td className="px-6 py-4 text-gray-700">{horse.age} years</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          horse.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : horse.status === 'resting'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {horse.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setHorseToEdit(horse);
                          }}
                          className="text-blue-500 hover:text-blue-700 mr-4 font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setHorseToDelete(horse);
                          }}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Horse Modal */}
      <AddNewHorseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setSuccessMessage({
            show: true,
            title: 'Horse Added',
            msg: 'New horse has been added successfully!'
          });
          fetchHorses();
        }} 
      />

      {/* Horse Detail Modal */}
      <HorseDetailModal 
        isOpen={selectedHorse !== null} 
        horse={selectedHorse} 
        onClose={() => setSelectedHorse(null)} 
        onEdit={(horse) => {
          setHorseToEdit(horse);
        }}
        onDelete={(horse) => {
          setHorseToDelete(horse);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={horseToDelete !== null}
        horse={horseToDelete}
        onClose={() => setHorseToDelete(null)}
        onSuccess={() => {
          setSelectedHorse(null);
          setSuccessMessage({
            show: true,
            title: 'Horse Deleted',
            msg: 'Horse has been deleted successfully!'
          });
          fetchHorses();
        }}
      />

      {/* Edit Horse Modal */}
      <EditHorseModal
        isOpen={horseToEdit !== null}
        horse={horseToEdit}
        onClose={() => setHorseToEdit(null)}
        onSuccess={() => {
          setSelectedHorse(null);
          setSuccessMessage({
            show: true,
            title: 'Horse Updated',
            msg: 'Horse details have been updated successfully!'
          });
          fetchHorses();
        }}
      />

      {/* Success Notification Modal */}
      <SuccessModal 
        isOpen={successMessage.show} 
        title={successMessage.title}
        message={successMessage.msg}
        onClose={() => setSuccessMessage(prev => ({ ...prev, show: false }))}
      />
    </HorseOwnerLayout>
  );
};

export default MyHorses;
