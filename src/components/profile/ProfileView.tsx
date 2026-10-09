import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Briefcase,
  Share2,
  Edit3,
  MessageSquare,
  Globe,
  Award,
  ArrowLeft,
  Plus,
  Check,
  FileCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PostCard } from '../feed/PostCard';
import { ServiceBookingModal } from '../services/ServiceBookingModal';
import { LegalService } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    users,
    currentUser,
    selectedProfileUserId,
    setActiveView,
    posts,
    replies,
    legalServices,
    publishLegalService,
    submitVerificationApplication,
    toggleFollowUser,
    startOrGetConversationWithUser,
    updateCurrentUserProfile,
    openLoginModal,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'services' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<LegalService | null>(null);

  // New Service Modal
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newSvcTitle, setNewSvcTitle] = useState('');
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcArea, setNewSvcArea] = useState('Land & Property Conveyancing');
  const [newSvcFee, setNewSvcFee] = useState(30000);

  // Bar verification modal
  const [isVerifModalOpen, setIsVerifModalOpen] = useState(false);
  const [verifBarRoll, setVerifBarRoll] = useState('');
  const [verifFirm, setVerifFirm] = useState('');
  const [verifExp, setVerifExp] = useState(3);
  const [verifSuccess, setVerifSuccess] = useState(false);

  // Edit fields
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editFee, setEditFee] = useState<number>(0);

  // Determine user to display
  const profileUserId = selectedProfileUserId || (currentUser ? currentUser.id : users[0].id);
  const profileUser = users.find(u => u.id === profileUserId) || users[0];
  const isOwnProfile = currentUser?.id === profileUser.id;

  const userPosts = posts.filter(p => p.authorId === profileUser.id);
  const userServices = legalServices.filter(s => s.providerId === profileUser.id);
  const savedPosts = currentUser ? posts.filter(p => p.bookmarkedBy.includes(currentUser.id)) : [];

  const isFollowing = currentUser?.followingIds?.includes(profileUser.id) || false;

  const startEdit = () => {
    setEditBio(profileUser.bio);
    setEditLocation(profileUser.location);
    setEditFee(profileUser.consultationFee || 25000);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateCurrentUserProfile({
      bio: editBio,
      location: editLocation,
      consultationFee: editFee
    });
    setIsEditing(false);
  };

  const handleMessageUser = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    const convId = startOrGetConversationWithUser(profileUser.id);
    setActiveView('messages');
  };

  const handleFollowClick = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleFollowUser(profileUser.id);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcTitle.trim()) return;

    publishLegalService({
      title: newSvcTitle.trim(),
      description: newSvcDesc.trim() || 'Comprehensive legal advisory session and documentation review.',
      practiceArea: newSvcArea,
      feeRWF: Number(newSvcFee) || 25000,
      formats: ['in_person', 'video'],
      turnaroundTime: '2 - 3 business days',
      locationProvince: 'Kigali City',
      requirements: ['Valid National ID / Passport', 'Relevant case documentation']
    });

    setIsNewServiceModalOpen(false);
    setNewSvcTitle('');
    setNewSvcDesc('');
    setActiveTab('services');
  };

  const handleApplyVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifBarRoll.trim()) return;

    submitVerificationApplication({
      barRollNumber: verifBarRoll.trim(),
      lawFirmName: verifFirm.trim() || 'Independent Practice',
      yearsOfExperience: Number(verifExp) || 1,
      practiceAreas: profileUser.practiceAreas || ['General Civil Law']
    });

    setVerifSuccess(true);
    setTimeout(() => {
      setVerifSuccess(false);
      setIsVerifModalOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top sticky header with back button */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center gap-4 z-20">
        <button
          onClick={() => setActiveView('feed')}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
            <span>{profileUser.name}</span>
            <VerificationBadge user={profileUser} size="sm" />
          </h1>
          <span className="text-2xs text-slate-500">
            {userPosts.length} posts
          </span>
        </div>
      </div>

      {/* Cover Banner (No external unsplash images - pure dynamic CSS gradients) */}
      <div
        className={`h-40 sm:h-52 bg-gradient-to-r ${
          profileUser.coverGradient || 'from-[#102744] via-[#1D4ED8] to-[#0F172A]'
        } relative overflow-hidden flex items-end p-4`}
      >
        <div className="absolute inset-0 bg-pattern opacity-10" />
      </div>

      {/* Profile Header Block */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pb-4">
        {/* Avatar and Action Buttons Row */}
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-3 relative">
          <div className="ring-4 ring-white rounded-full bg-white shadow-md">
            <UserAvatar user={profileUser} size="2xl" className="w-22 h-22 sm:w-26 sm:h-26" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={startEdit}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {!profileUser.isVerified && profileUser.role !== 'admin' && (
                  <button
                    onClick={() => setIsVerifModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Apply for Bar Verification</span>
                  </button>
                )}

                {profileUser.role === 'advocate' && (
                  <button
                    onClick={() => setIsNewServiceModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List New Service</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setActiveView('feed');
                  }}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Sign out of your session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMessageUser}
                  className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition"
                  title="Send private message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={handleFollowClick}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-[#102744] hover:bg-slate-800 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                {profileUser.role === 'advocate' && userServices.length > 0 && (
                  <button
                    onClick={() => setSelectedServiceForBooking(userServices[0])}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Book Consultation</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-slate-900">
                {profileUser.name}
              </h2>
              <VerificationBadge user={profileUser} size="md" showLabel={true} />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              @{profileUser.username}
            </p>
          </div>

          {/* Professional Credentials Banner if Advocate */}
          {profileUser.role === 'advocate' && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 my-2 text-xs">
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-blue-950 font-semibold mb-1">
                {profileUser.barRollNumber && (
                  <span>
                    📜 Roll No: <strong className="font-extrabold">{profileUser.barRollNumber}</strong>
                  </span>
                )}
                {profileUser.firmName && (
                  <span>
                    🏢 Firm: <strong>{profileUser.firmName}</strong>
                  </span>
                )}
                {profileUser.consultationFee && (
                  <span>
                    💳 Fee: <strong>{profileUser.consultationFee.toLocaleString()} RWF</strong> / session
                  </span>
                )}
              </div>

              {profileUser.practiceAreas && profileUser.practiceAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {profileUser.practiceAreas.map(area => (
                    <span
                      key={area}
                      className="bg-white border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Institutional Banner */}
          {profileUser.role === 'institution' && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 my-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-0.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Verified Statutory Government Institution</span>
              </div>
              <p className="text-2xs text-amber-800">
                Authorized for publishing official gazette communiqués, statutory circulars, and judicial awareness programs.
              </p>
            </div>
          )}

          {/* Bio */}
          <p className="text-xs text-slate-800 leading-relaxed max-w-2xl">
            {profileUser.bio}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-slate-500 pt-1">
            {profileUser.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profileUser.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {profileUser.joinedDate}</span>
            </div>
            {profileUser.languages && profileUser.languages.length > 0 && (
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{profileUser.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center gap-4 text-xs pt-1">
            <div>
              <span className="font-extrabold text-slate-900">
                {profileUser.followingCount}
              </span>{' '}
              <span className="text-slate-500">Following</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900">
                {profileUser.followersCount}
              </span>{' '}
              <span className="text-slate-500">Followers</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-slate-200 mt-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Posts ({userPosts.length})
          </button>

          {profileUser.role === 'advocate' && (
            <button
              onClick={() => setActiveTab('services')}
              className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'services'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Services & Fees ({userServices.length})
            </button>
          )}

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Bookmarks ({savedPosts.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Stream */}
      <div className="divide-y divide-slate-200">
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white">
              No posts published yet by this user.
            </div>
          ) : (
            userPosts.map(post => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'services' && (
          <div className="p-4 bg-white space-y-4">
            {userServices.length === 0 ? (
              <p className="text-xs text-slate-500">No services listed yet.</p>
            ) : (
              userServices.map(service => (
                <div
                  key={service.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {service.practiceArea}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {service.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-blue-700">
                        {service.feeRWF.toLocaleString()} RWF
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {service.turnaroundTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-2xs text-slate-500">
                      Formats: {service.formats.join(', ')}
                    </span>
                    <button
                      onClick={() => setSelectedServiceForBooking(service)}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          savedPosts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white">
              You haven't bookmarked any legal posts yet.
            </div>
          ) : (
            savedPosts.map(post => <PostCard key={post.id} post={post} />)
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Edit Your Profile</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bio</label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {profileUser.role === 'advocate' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Standard Consultation Fee (RWF)
                </label>
                <input
                  type="number"
                  value={editFee}
                  onChange={e => setEditFee(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 text-xs font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Legal Service Modal */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900">Publish New Legal Service Offering</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={newSvcTitle}
                  onChange={e => setNewSvcTitle(e.target.value)}
                  placeholder="e.g. Commercial Lease Agreement Review"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Practice Area</label>
                <select
                  value={newSvcArea}
                  onChange={e => setNewSvcArea(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Land & Property Conveyancing">Land & Property Conveyancing</option>
                  <option value="Commercial Law">Commercial Law</option>
                  <option value="Labor Disputes">Labor Disputes</option>
                  <option value="Criminal Defense">Criminal Defense</option>
                  <option value="Family & Succession">Family & Succession</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fixed Fee (RWF)</label>
                <input
                  type="number"
                  required
                  value={newSvcFee}
                  onChange={e => setNewSvcFee(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Service Scope & Description</label>
                <textarea
                  value={newSvcDesc}
                  onChange={e => setNewSvcDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe scope of work included in this consultation..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800"
                >
                  Publish Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Bar Verification Modal */}
      {isVerifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900">Apply for Rwanda Bar Association Verification</h3>

            {verifSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">Application Submitted to Verification Queue!</p>
                <p className="text-2xs text-slate-500">
                  Our compliance team will review your Bar Roll Number against the active Rwanda Bar Association roster.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyVerification} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Bar Roll Number</label>
                  <input
                    type="text"
                    required
                    value={verifBarRoll}
                    onChange={e => setVerifBarRoll(e.target.value)}
                    placeholder="e.g. RBA/1940/2024"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Law Firm / Practice Name</label>
                  <input
                    type="text"
                    required
                    value={verifFirm}
                    onChange={e => setVerifFirm(e.target.value)}
                    placeholder="e.g. Kigali Legal Associates"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Years of Post-Qualification Experience</label>
                  <input
                    type="number"
                    value={verifExp}
                    onChange={e => setVerifExp(Number(e.target.value))}
                    min={1}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsVerifModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800"
                  >
                    Submit for Bar Audit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedServiceForBooking && (
        <ServiceBookingModal
          service={selectedServiceForBooking}
          onClose={() => setSelectedServiceForBooking(null)}
        />
      )}
    </div>
  );
};
