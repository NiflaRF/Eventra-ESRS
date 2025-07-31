import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  fullName: string;
  role: string;
  department: string;
  faculty: string;
  bio: string;
  designation: string;
  eventInterests: string;
}

const UserProfileCard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    role: '',
    department: '',
    faculty: '',
    bio: '',
    designation: '',
    eventInterests: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEditProfile(profile);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setEditMode(false);
  };

  const handleSave = () => {
    setProfile(editProfile);
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-black bg-opacity-80 rounded-2xl shadow-md p-14 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0 mr-6">User Profile</h2>
        {!editMode && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Edit Profile
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="block w-40 text-sm font-medium text-white">Full Name</label>
          {editMode ? (
            <input
              type="text"
              name="fullName"
              value={editProfile.fullName}
              onChange={handleChange}
              className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="mt-1 sm:mt-0 sm:ml-2 text-white font-semibold">{profile.fullName}</div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="block w-40 text-sm font-medium text-white">Role</label>
          {editMode ? (
            <input
              type="text"
              name="role"
              value={editProfile.role}
              onChange={handleChange}
              className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="mt-1 sm:mt-0 sm:ml-2 text-white">{profile.role}</div>
          )}
        </div>
        {/* Department - hide for vice chancellor and warden */}
        {user?.role !== 'vice-chancellor' && user?.role !== 'warden' && (
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="block w-40 text-sm font-medium text-white">Department</label>
            {editMode ? (
              <input
                type="text"
                name="department"
                value={editProfile.department}
                onChange={handleChange}
                className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1 sm:mt-0 sm:ml-2 text-white">{profile.department}</div>
            )}
          </div>
        )}
        {/* Faculty - hide for vice chancellor and warden */}
        {user?.role !== 'vice-chancellor' && user?.role !== 'warden' && (
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="block w-40 text-sm font-medium text-white">Faculty</label>
            {editMode ? (
              <input
                type="text"
                name="faculty"
                value={editProfile.faculty}
                onChange={handleChange}
                className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1 sm:mt-0 sm:ml-2 text-white">{profile.faculty}</div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="block w-40 text-sm font-medium text-white">Designation</label>
          {editMode ? (
            <input
              type="text"
              name="designation"
              value={editProfile.designation}
              onChange={handleChange}
              className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="mt-1 sm:mt-0 sm:ml-2 text-white">{profile.designation}</div>
          )}
        </div>
        {/* Move Bio directly below Designation, with extra space */}
        <div className="flex flex-col sm:flex-row sm:items-start mt-6 mb-6">
          <label className="block w-40 text-sm font-medium text-white">Bio</label>
          {editMode ? (
            <textarea
              name="bio"
              value={editProfile.bio}
              onChange={handleChange}
              className="mt-1 sm:mt-0 sm:ml-2 flex-1 min-h-[80px] bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          ) : (
            <div className="mt-1 sm:mt-0 sm:ml-2 text-white whitespace-pre-line min-h-[80px] flex items-center">{profile.bio}</div>
          )}
        </div>
        {/* Add extra margin before Event Interest Tags, only if not service-provider, not vice-chancellor, not administration, not student-union, and not warden */}
        {user?.role !== 'service-provider' && user?.role !== 'vice-chancellor' && user?.role !== 'administration' && user?.role !== 'student-union' && user?.role !== 'warden' && (
          <div className="flex flex-col sm:flex-row sm:items-center mt-6">
            <label className="block w-40 text-sm font-medium text-white">Event Interests</label>
            {editMode ? (
              <input
                type="text"
                name="eventInterests"
                value={editProfile.eventInterests}
                onChange={handleChange}
                className="mt-1 sm:mt-0 sm:ml-2 flex-1 bg-gray-800/60 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Tech, Workshops, Seminars"
              />
            ) : (
              <div className="mt-1 sm:mt-0 sm:ml-2 flex flex-wrap gap-2 min-h-[1.5rem]">
                {profile.eventInterests.trim() &&
                  profile.eventInterests.split(',').map((tag, idx) => (
                    <span key={idx} className="bg-gray-700/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}
        {editMode && (
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Profile: React.FC = () => (
  <Layout>
    <div className="min-h-screen w-full relative flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#bd7880',
          width: '100%',
          height: '100%',
        }}
      />
      {/* Removed dark overlay for lighter appearance */}
      <div className="relative z-20 w-full flex justify-center items-center">
        <UserProfileCard />
      </div>
    </div>
  </Layout>
);

export default Profile; 