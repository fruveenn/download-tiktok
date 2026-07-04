// ============================================
// TIKTOK DOWNLOADER - FULL WORKING SCRIPT
// CREATED BY LORD GPT FOR UCUP
// ============================================

// Particles
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// Stats Counter
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetNumber = parseInt(target.getAttribute('data-target'));
                const duration = 2000;
                const step = targetNumber / (duration / 16);
                let current = 0;
                const updateCounter = () => {
                    current += step;
                    if (current < targetNumber) {
                        target.textContent = Math.floor(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.textContent = targetNumber.toLocaleString();
                    }
                };
                updateCounter();
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(stat => observer.observe(stat));
}

// Smooth Scroll
function handleSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Paste Button
function handlePaste() {
    document.getElementById('pasteBtn').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('urlInput').value = text;
        } catch (err) {
            alert('Gagal akses clipboard!');
        }
    });
}

// Example URLs
function handleExampleUrls() {
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('urlInput').value = btn.getAttribute('data-url');
        });
    });
}

// Notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'rgba(0, 255, 136, 0.2)',
        error: 'rgba(255, 51, 51, 0.2)',
        info: 'rgba(255, 170, 0, 0.2)'
    };
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        background: ${colors[type]};
        border: 1px solid ${type === 'success' ? 'rgba(0,255,136,0.3)' : type === 'error' ? 'rgba(255,51,51,0.3)' : 'rgba(255,170,0,0.3)'};
        backdrop-filter: blur(10px);
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    notification.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format Number
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Loading Steps Animation
function simulateLoadingSteps() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active', 'completed'));
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
            steps[currentStep - 1].classList.add('completed');
        }
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

// Show Result
function showResult(data) {
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('videoPlayer').src = data.videoUrl;
    document.getElementById('authorName').textContent = data.author || 'Unknown';
    document.getElementById('viewCount').textContent = formatNumber(data.views || 0);
    document.getElementById('likeCount').textContent = formatNumber(data.likes || 0);
    document.getElementById('downloadHD').href = data.videoUrl || '#';
    document.getElementById('downloadSD').href = data.videoUrl || '#';
    document.getElementById('downloadAudio').href = data.audioUrl || '#';
    document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show Error
function showError(message) {
    document.getElementById('errorCard').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ========== MAIN DOWNLOAD FUNCTION ==========
async function handleDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    const urlInput = document.getElementById('urlInput');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultCard = document.getElementById('resultCard');
    const errorCard = document.getElementById('errorCard');
    
    downloadBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        // Validasi
        if (!url) {
            showNotification('Masukkan URL TikTok dulu!', 'error');
            return;
        }
        
        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok')) {
            showNotification('URL bukan dari TikTok!', 'error');
            return;
        }
        
        // Reset
        downloadBtn.classList.add('loading');
        loadingOverlay.style.display = 'flex';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';
        document.getElementById('loaderText').textContent = 'Mengambil video...';
        
        simulateLoadingSteps();
        
        try {
            // API 1: TikWM
            const formData = new URLSearchParams();
            formData.append('url', url);
            formData.append('count', '12');
            formData.append('cursor', '0');
            formData.append('web', '1');
            formData.append('hd', '1');
            
            const response = await fetch('https://www.tikwm.com/api/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: formData
            });
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.code === 0 && data.data) {
                // Sukses!
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    downloadBtn.classList.remove('loading');
                    
                    showResult({
                        videoUrl: data.data.hdplay || data.data.play,
                        audioUrl: data.data.music,
                        author: data.data.author?.nickname || 'TikTok User',
                        title: data.data.title || '',
                        views: data.data.play_count || 0,
                        likes: data.data.digg_count || 0,
                        duration: data.data.duration || '00:00'
                    });
                    
                    showNotification('Video berhasil ditemukan!', 'success');
                }, 1500);
            } else {
                throw new Error('Video tidak ditemukan');
            }
        } catch (error1) {
            console.log('API 1 gagal, coba API 2...');
            
            // API 2: Tiklydown
            try {
                const response2 = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
                const data2 = await response2.json();
                console.log('API 2 Response:', data2);
                
                if (data2.video?.noWatermark || data2.video?.url) {
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                        downloadBtn.classList.remove('loading');
                        
                        showResult({
                            videoUrl: data2.video.noWatermark || data2.video.url,
                            audioUrl: data2.music?.url || '',
                            author: data2.author?.name || 'TikTok User',
                            views: 0,
                            likes: 0
                        });
                        
                        showNotification('Video berhasil ditemukan!', 'success');
                    }, 1500);
                } else {
                    throw new Error('Gagal');
                }
            } catch (error2) {
                console.log('API 2 gagal, coba API 3...');
                
                // API 3: Last resort
                try {
                    const response3 = await fetch(`https://tikdown-api.vercel.app/api/download?url=${encodeURIComponent(url)}`);
                    const data3 = await response3.json();
                    
                    if (data3.video) {
                        setTimeout(() => {
                            loadingOverlay.style.display = 'none';
                            downloadBtn.classList.remove('loading');
                            
                            showResult({
                                videoUrl: data3.video,
                                audioUrl: data3.audio || '',
                                author: 'TikTok User',
                                views: 0,
                                likes: 0
                            });
                            
                            showNotification('Video berhasil ditemukan!', 'success');
                        }, 1500);
                    } else {
                        throw new Error('Gagal');
                    }
                } catch (error3) {
                    // Semua API gagal
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                        downloadBtn.classList.remove('loading');
                        showError('Gagal mendownload video. Server TikTok mungkin sedang error. Coba lagi nanti atau gunakan URL lain.');
                        showNotification('Download gagal! Coba lagi.', 'error');
                    }, 1500);
                }
            }
        }
    });
}

// Close Result
function handleCloseResult() {
    document.getElementById('closeResult').addEventListener('click', () => {
        document.getElementById('resultCard').style.display = 'none';
        document.getElementById('videoPlayer').src = '';
    });
}

// Retry Button
function handleRetry() {
    document.getElementById('retryBtn').addEventListener('click', () => {
        document.getElementById('errorCard').style.display = 'none';
        document.getElementById('downloadBtn').click();
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    animateStats();
    handleSmoothScroll();
    handlePaste();
    handleExampleUrls();
    handleDownload();
    handleCloseResult();
    handleRetry();
    console.log('🔥 TikTok Downloader Ready!');
});

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);