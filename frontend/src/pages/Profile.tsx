import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile, useUpdateProfile } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  total_points: number;
  level: number;
  badges: string[];
  created_at: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading, error, refetch } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const { handleError } = useErrorHandler();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (error) {
      handleError(error, 'Failed to update profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-gray-400 mb-4">Failed to load your profile information.</p>
          <button 
            onClick={() => refetch()}
            className="bg-netflix-red hover:bg-red-700 px-6 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-netflix-gray rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-netflix-red hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-netflix-black p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Total Points</h3>
                <p className="text-3xl font-bold text-netflix-red">{profile?.total_points || 0}</p>
              </div>
              <div className="bg-netflix-black p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Level</h3>
                <p className="text-3xl font-bold text-yellow-500">{profile?.level || 1}</p>
              </div>
              <div className="bg-netflix-black p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Badges</h3>
                <p className="text-3xl font-bold text-blue-500">{profile?.badges?.length || 0}</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full p-3 bg-netflix-black border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border border-gray-600 rounded-lg transition-colors ${
                      isEditing 
                        ? 'bg-netflix-black text-white focus:border-netflix-red focus:outline-none' 
                        : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border border-gray-600 rounded-lg transition-colors ${
                      isEditing 
                        ? 'bg-netflix-black text-white focus:border-netflix-red focus:outline-none' 
                        : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border border-gray-600 rounded-lg transition-colors ${
                      isEditing 
                        ? 'bg-netflix-black text-white focus:border-netflix-red focus:outline-none' 
                        : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-netflix-red hover:bg-red-700 disabled:opacity-50 px-6 py-2 rounded transition-colors"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Badges Section */}
          {profile?.badges && profile.badges.length > 0 && (
            <div className="bg-netflix-gray rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">My Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.badges.map((badge, index) => (
                  <div key={index} className="bg-netflix-black p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-sm font-medium">{badge}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;