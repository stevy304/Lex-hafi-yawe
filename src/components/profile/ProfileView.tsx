import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Globe,
  Award,
  Edit3,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  Plus,
  Check,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PostCard } from '../feed/PostCard';
import { ServiceBookingModal } from '../services/ServiceBookingModal';
import { LegalService } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const ProfileView: React.FC = () => {
  const {
    users,
    currentUser,
    selectedProfileUserId,
    setActiveView,
    posts,
    legalServices,
    publishLegalService,
    submitVerificationApplication,
    toggleFollowUser,
    startOrGetConversationWithUser,
    updateCurrentUserProfile,
    openLoginModal,
    logout,
    setIsCreatePostModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'services' | 'saved'>('posts');
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
  const profileUser = users.find((u) => u.id === profileUserId) || users[0];
  const isOwnProfile = currentUser?.id === profileUser.id;

  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const userServices = legalServices.filter((s) => s.providerId === profileUser.id);
  const savedPosts = currentUser ? posts.filter((p) => p.bookmarkedBy.includes(currentUser.id)) : [];

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
      consultationFee: editFee,
    });
    setIsEditing(false);
  };

  const handleMessageUser = async () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    await startOrGetConversationWithUser(profileUser.id);
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
      requirements: ['Valid National ID / Passport', 'Relevant case documentation'],
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
      practiceAreas: profileUser.practiceAreas || ['General Civil Law'],
    });

    setVerifSuccess(true);
    setTimeout(() => {
      setVerifSuccess(false);
      setIsVerifModalOpen(false);
    }, 2000);
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      {/* Sticky header with back button */}
      <PageHeader
        title={profileUser.name}
        subtitle={`${userPosts.length} posts`}
        onBack={() => setActiveView('feed')}
      />

      {/* Cover Banner */}
      <div
        className={`h-36 sm:h-44 bg-gradient-to-r ${
          profileUser.coverGradient || 'from-[#102744] via-[#1D4ED8] to-[#0F172A]'
        } relative overflow-hidden flex items-end p-4`}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Profile Header Block */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 pb-4">
        {/* Avatar and Action Buttons Row */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3 relative">
          <div className="ring-4 ring-[var(--surface)] rounded-full bg-[var(--surface)] shadow-md">
            <UserAvatar user={profileUser} size="2xl" className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="px-3.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--hover)] text-[var(--text)] border border-[var(--border)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit profile</span>
                </button>

                {!profileUser.isVerified && profileUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => setIsVerifModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--hover)] text-[var(--accent)] border border-[var(--border)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Apply for bar verification</span>
                  </button>
                )}

                {profileUser.role === 'advocate' && (
                  <button
                    type="button"
                    onClick={() => setIsNewServiceModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List service</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setActiveView('feed');
                  }}
                  className="px-3.5 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--danger)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Sign out of your session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleMessageUser}
                  className="p-2 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)] rounded-full transition-colors cursor-pointer"
                  title="Send private message"
                  aria-label="Send private message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleFollowClick}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                    isFollowing
                      ? 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--danger)] hover:text-[var(--danger)]'
                      : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                {profileUser.role === 'advocate' && userServices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedServiceForBooking(userServices[0])}
                    className="px-4 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Book consultation</span>
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
              <h2 className="text-[18px] font-semibold text-[var(--text)] m-0">
                {profileUser.name}
              </h2>
              <VerificationBadge user={profileUser} size="md" showLabel={true} />
            </div>
            <p className="text-[13px] text-[var(--muted)] m-0 font-medium">
              @{profileUser.username}
            </p>
          </div>

          {/* Professional Credentials Banner if Advocate */}
          {profileUser.role === 'advocate' && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] p-3 my-2 text-[13px]">
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[var(--text)] font-medium mb-1">
                {profileUser.barRollNumber && (
                  <span>
                    Roll no: <strong>{profileUser.barRollNumber}</strong>
                  </span>
                )}
                {profileUser.firmName && (
                  <span>
                    Firm: <strong>{profileUser.firmName}</strong>
                  </span>
                )}
                {profileUser.consultationFee && (
                  <span>
                    Fee: <strong>{profileUser.consultationFee.toLocaleString()} RWF</strong> / session
                  </span>
                )}
              </div>

              {profileUser.practiceAreas && profileUser.practiceAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {profileUser.practiceAreas.map((area) => (
                    <span
                      key={area}
                      className="bg-[var(--surface)] border border-[var(--border)] text-[var(--gold)] text-[11px] font-medium px-2 py-0.5 rounded"
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
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] p-3 my-2 text-[13px] text-[var(--text)]">
              <div className="flex items-center gap-2 font-medium mb-0.5 text-[var(--gold)]">
                <Award className="w-4 h-4" />
                <span>Verified statutory government institution</span>
              </div>
              <p className="text-[12px] text-[var(--muted)] m-0">
                Authorized for publishing official gazette communiqués, statutory circulars, and judicial awareness programs.
              </p>
            </div>
          )}

          {/* Bio */}
          <p className="text-[14px] text-[var(--text)] leading-relaxed m-0">
            {profileUser.bio}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--muted)] pt-1">
            {profileUser.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profileUser.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {profileUser.joinedDate}</span>
            </div>
            {profileUser.languages && profileUser.languages.length > 0 && (
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{profileUser.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center gap-4 text-[13px] pt-1">
            <div>
              <span className="font-semibold text-[var(--text)]">
                {profileUser.followingCount}
              </span>{' '}
              <span className="text-[var(--muted)]">Following</span>
            </div>
            <div>
              <span className="font-semibold text-[var(--text)]">
                {profileUser.followersCount}
              </span>{' '}
              <span className="text-[var(--muted)]">Followers</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-[var(--border)] mt-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`py-2.5 px-4 text-[13px] font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Posts ({userPosts.length})
          </button>

          {profileUser.role === 'advocate' && (
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`py-2.5 px-4 text-[13px] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'services'
                  ? 'border-[var(--accent)] text-[var(--text)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Services ({userServices.length})
            </button>
          )}

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`py-2.5 px-4 text-[13px] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-[var(--accent)] text-[var(--text)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Bookmarks ({savedPosts.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Stream */}
      <div className="divide-y divide-[var(--border)]">
        {activeTab === 'posts' &&
          (userPosts.length === 0 ? (
            <EmptyState
              title={
                isOwnProfile
                  ? "You haven't published any posts yet"
                  : 'No posts published yet by this user'
              }
              description={
                isOwnProfile
                  ? 'Share your legal perspective, ask a statutory question, or publish an article.'
                  : 'When this user publishes legal updates or commentary, they will appear here.'
              }
              action={
                isOwnProfile
                  ? {
                      label: 'Create first post',
                      onClick: () => setIsCreatePostModalOpen(true),
                    }
                  : undefined
              }
            />
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}

        {activeTab === 'services' && (
          <div className="p-4 space-y-3">
            {userServices.length === 0 ? (
              <EmptyState
                title="No legal services listed yet"
                description="List your legal advisory offerings and fixed consultation honorarium."
                action={
                  isOwnProfile && profileUser.role === 'advocate'
                    ? {
                        label: 'List service',
                        onClick: () => setIsNewServiceModalOpen(true),
                      }
                    : undefined
                }
              />
            ) : (
              userServices.map((service) => (
                <Card key={service.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded">
                        {service.practiceArea}
                      </span>
                      <h3 className="text-[15px] font-medium text-[var(--text)] mt-1.5">
                        {service.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[15px] font-semibold text-[var(--accent)]">
                        {service.feeRWF.toLocaleString()} RWF
                      </span>
                      <span className="text-[11px] text-[var(--muted)] block">
                        {service.turnaroundTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-[12px] text-[var(--muted)]">
                      Formats: {service.formats.join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForBooking(service)}
                      className="px-3.5 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Book consultation
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' &&
          (savedPosts.length === 0 ? (
            <EmptyState
              title="No bookmarks yet"
              description="You haven't bookmarked any legal posts yet."
            />
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">Edit your profile</h3>
            <div>
              <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            {profileUser.role === 'advocate' && (
              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                  Standard consultation fee (RWF)
                </label>
                <input
                  type="number"
                  value={editFee}
                  onChange={(e) => setEditFee(Number(e.target.value))}
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Legal Service Modal */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">Publish new legal service</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Service title</label>
                <input
                  type="text"
                  required
                  value={newSvcTitle}
                  onChange={(e) => setNewSvcTitle(e.target.value)}
                  placeholder="e.g. Commercial Lease Agreement Review"
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Practice area</label>
                <select
                  value={newSvcArea}
                  onChange={(e) => setNewSvcArea(e.target.value)}
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="Land & Property Conveyancing">Land & Property Conveyancing</option>
                  <option value="Commercial Law">Commercial Law</option>
                  <option value="Labor Disputes">Labor Disputes</option>
                  <option value="Criminal Defense">Criminal Defense</option>
                  <option value="Family & Succession">Family & Succession</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Fixed fee (RWF)</label>
                <input
                  type="number"
                  required
                  value={newSvcFee}
                  onChange={(e) => setNewSvcFee(Number(e.target.value))}
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Service scope and description</label>
                <textarea
                  value={newSvcDesc}
                  onChange={(e) => setNewSvcDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe scope of work included in this consultation..."
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Publish service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Bar Verification Modal */}
      {isVerifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">Apply for Rwanda Bar Association verification</h3>

            {verifSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 bg-[var(--ok-bg)] text-[var(--ok-text)] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-[14px] font-medium text-[var(--text)]">Application submitted to verification queue</p>
                <p className="text-[12px] text-[var(--muted)]">
                  Our compliance team will review your Bar Roll Number against the active Rwanda Bar Association roster.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyVerification} className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Bar roll number</label>
                  <input
                    type="text"
                    required
                    value={verifBarRoll}
                    onChange={(e) => setVerifBarRoll(e.target.value)}
                    placeholder="e.g. RBA/1940/2024"
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Law firm / Practice name</label>
                  <input
                    type="text"
                    required
                    value={verifFirm}
                    onChange={(e) => setVerifFirm(e.target.value)}
                    placeholder="e.g. Kigali Legal Associates"
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Years of experience</label>
                  <input
                    type="number"
                    value={verifExp}
                    onChange={(e) => setVerifExp(Number(e.target.value))}
                    min={1}
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2.5 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsVerifModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Submit for bar audit
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
