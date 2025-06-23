import { useState, useEffect, useRef } from 'react'
import { FiUsers, FiUserPlus, FiAward, FiTrendingUp, FiUserCheck, FiUserX, FiMail, FiActivity } from 'react-icons/fi'
import { gsap } from 'gsap'
import { useUserProgress } from '../../context/UserProgressContext'
import { FaTrophy } from 'react-icons/fa'
import { generateNewFriendAvatar } from '../../utils/avatarUtils'
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getFriendRequests } from '../../api/userApi'
import { useAuth } from '../../context/AuthContext'

const Friends = () => {
  const { 
    friends, 
    addFriend, 
    removeFriend, 
    getFriendsRanking, 
    weeklyChampion,
    customNickname,
    selectedAvatar,
    currentStreak,
    totalPoints,
    weeklyPoints,
    friendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    fetchFriends,
    fetchFriendRequests
  } = useUserProgress()
  
  const [ranking, setRanking] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('ranking') // 'ranking' or 'requests'
  const [newFriend, setNewFriend] = useState({
    name: '',
    email: '',
    avatar: generateNewFriendAvatar('New')
  })
  const [emailError, setEmailError] = useState('')
  const [addFriendStatus, setAddFriendStatus] = useState('')
  
  const containerRef = useRef(null)
  const championRef = useRef(null)
  const rankingRef = useRef(null)
  
  // Sıralamayı yükle
  useEffect(() => {
    const ranking = getFriendsRanking()
    setRanking(ranking)
    
    // Sayfa animasyonları - Güvenli bir şekilde animasyonları uygula
    const animateElements = () => {
      try {
        const container = containerRef.current
        if (container) {
          const titleElements = container.querySelectorAll('.section-title')
          if (titleElements && titleElements.length > 0) {
            gsap.fromTo(titleElements,
              { opacity: 0, y: -20 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            )
          }
        }
        
        // Şampiyon kartı animasyonu
        if (championRef.current && weeklyChampion) {
          gsap.fromTo(championRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)' }
          )
        }
        
        // Sıralama listesi animasyonu
        if (rankingRef.current) {
          const rankItems = rankingRef.current.querySelectorAll('.rank-item')
          if (rankItems && rankItems.length > 0) {
            gsap.fromTo(rankItems,
              { opacity: 0, x: -20 },
              { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
            )
          }
        }
      } catch (error) {
        console.error("Animation error:", error)
      }
    }
    
    // Animasyonları bir sonraki frame'de çalıştır (DOM güncellemelerinden sonra)
    const timeoutId = setTimeout(animateElements, 100)
    return () => clearTimeout(timeoutId)
  }, [getFriendsRanking, weeklyChampion])
  
  // Arkadaş arama
  const filteredFriends = ranking.filter(
    friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (friend.email && friend.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  // Kendi kullanıcı bilgileri
  const { user } = useAuth();
  
  // Email formatını doğrula
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Yeni arkadaş ekleme
  const handleAddFriend = async () => {
    setEmailError('');
    setAddFriendStatus('');
    if (!validateEmail(newFriend.email)) {
      setEmailError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    try {
      setAddFriendStatus('İstek gönderiliyor...');
      await sendFriendRequest(newFriend.email);
      setAddFriendStatus('Arkadaşlık isteği gönderildi!');
      setShowAddModal(false);
      setNewFriend({ email: '' });
      fetchFriendRequests();
    } catch (err) {
      setEmailError(err?.message || 'İstek gönderilemedi.');
    }
  };
  
  // Arkadaşlık isteğini kabul et
  const handleAcceptRequest = async (requestId) => {
    await acceptFriendRequest(requestId);
    fetchFriends();
    fetchFriendRequests();
  };

  // Arkadaşlık isteğini reddet
  const handleRejectRequest = async (requestId) => {
    await rejectFriendRequest(requestId);
    fetchFriendRequests();
  };
  
  useEffect(() => {
    fetchFriends();
    const handleDataUpdated = () => {
      fetchFriends();
    };
    window.addEventListener('dataUpdated', handleDataUpdated);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdated);
    };
  }, []);
  
  return (
    <div ref={containerRef} className="space-y-8">
      {/* Başlık */}
      <div className="section-title">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FiUsers className="mr-2 text-primary" /> Arkadaşlar
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Arkadaşlarınla rekabet et ve birlikte ilerleme kaydet
        </p>
      </div>
      
      {/* Haftanın Şampiyonu */}
      {weeklyChampion && (
        <div ref={championRef} className="section-title">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FiAward className="mr-2 text-yellow-500" /> Haftanın Şampiyonu
          </h2>
          
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-md">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg">
                  <img 
                    src={weeklyChampion.avatar} 
                    alt={weeklyChampion.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                  <FiAward size={18} />
                </div>
              </div>
              
              <div className="ml-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  {weeklyChampion.name}
                  {weeklyChampion.isCurrentUser && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Sen</span>
                  )}
                </h3>
                
                <div className="mt-1 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                      <FiAward className="mr-1" size={14} />
                      <span className="font-medium">{weeklyChampion.weeklyPoints} puan</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{weeklyChampion.streak} gün seri</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bu haftanın lideri! 🏆
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'ranking' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiTrendingUp className="inline mr-1" /> Sıralama
        </button>
        
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 text-sm font-medium flex items-center ${
            activeTab === 'requests' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiMail className="mr-1" /> İstekler
          {friendRequests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{friendRequests.length}</span>
          )}
        </button>
      </div>
      
      {/* Arkadaş Sıralaması */}
      {activeTab === 'ranking' && (
        <div className="section-title">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FiTrendingUp className="mr-2 text-primary" /> Sıralama
            </h2>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 flex items-center">
                <FiAward className="mr-1" size={10} />
                {(user && typeof user.points === 'number') ? user.points : 0} Puan
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full px-2 py-0.5 flex items-center">
                <FiActivity className="mr-1" size={10} />
                Seri: {(user && typeof user.currentStreak === 'number') ? user.currentStreak : 0}
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FiUserPlus className="mr-1" /> Arkadaş Ekle
            </button>
          </div>
          
          {/* Arama kutusu */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Arkadaş ara (isim veya e-posta)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Arkadaş listesi */}
          <div ref={rankingRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            {filteredFriends.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <FiUsers className="mx-auto h-12 w-12 opacity-40 mb-2" />
                <p>Henüz arkadaş bulunamadı.</p>
                <p className="text-sm mt-1">Arkadaş eklemek için "Arkadaş Ekle" butonuna tıklayın.</p>
              </div>
            ) : (
              <div>
                {filteredFriends.map((friend, index) => (
                  <div 
                    key={friend._id || friend.id} 
                    className="rank-item flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-lg bg-gray-100 dark:bg-gray-700 text-primary rounded-full">
                        {index + 1}
                      </div>
                      
                      <div className="ml-3 flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={friend.avatarUrl || friend.avatar || '/default-avatar.png'} 
                            alt={friend.name || friend.email || 'Arkadaş'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <div className="font-medium text-black dark:text-white group-hover:text-black flex items-center">
                            {friend.name || friend.email || 'Arkadaş'}
                            {friend.isCurrentUser && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Sen</span>
                            )}
                          </div>
                          {friend.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black">{friend.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="font-medium text-black dark:text-white group-hover:text-black">{friend.points || 0} puan</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black">
                          {friend.streak} gün seri
                        </div>
                      </div>
                      
                      {!friend.isCurrentUser && (
                        <button 
                          onClick={() => removeFriend(friend._id || friend.id)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Arkadaş İstekleri */}
      {activeTab === 'requests' && (
        <div className="section-title">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FiMail className="mr-2 text-primary" /> Arkadaşlık İstekleri
            </h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            {friendRequests.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <FiMail className="mx-auto h-12 w-12 opacity-40 mb-2" />
                <p>Henüz arkadaşlık isteği bulunmuyor.</p>
              </div>
            ) : (
              <div>
                {friendRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 group transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-200 dark:border-gray-600">
                        <img 
                          src={request.fromAvatar || '/default-avatar.png'} 
                          alt={request.fromName || 'Arkadaş'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white">
                          {request.fromName || 'Arkadaş'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          İstek tarihi: {new Date(request.date).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.from)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                      >
                        <FiUserCheck className="mr-1" /> Kabul Et
                      </button>
                      
                      <button
                        onClick={() => handleRejectRequest(request.from)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <FiUserX className="mr-1" /> Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Arkadaş Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Arkadaş Ekle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={newFriend.email}
                  onChange={(e) => setNewFriend({ email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="ornek@email.com"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
                )}
                {addFriendStatus && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">{addFriendStatus}</p>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddFriend}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Friends 