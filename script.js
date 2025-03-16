// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqIMSYzR8ygtt7jgAvOlI_9NCQSxYR6y8",
  authDomain: "rentedbyelliot-store.firebaseapp.com",
  databaseURL: "https://rentedbyelliot-store-default-rtdb.firebaseio.com",
  projectId: "rentedbyelliot-store",
  storageBucket: "rentedbyelliot-store.firebasestorage.app",
  messagingSenderId: "772266284939",
  appId: "1:772266284939:web:4350f1b5cabc0caaf4418e",
  measurementId: "G-VZ7NNLDN8G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const db = firebase.firestore();
const realTimeDb = firebase.database();
const auth = firebase.auth();

const MoviePage = {
  template: `
    <div>
      <div class="movie-card">
        <div class="movie-cover" :style="{ backgroundImage: 'url(' + movie.coverPoster + ')' }">
          <img class="movie-poster" :src="movie.poster" alt="Movie Poster">
          <div class="play-button">
            <button @click="trackWatchNow">
              <i class="fas fa-play"></i> Watch Now
            </button>
          </div>
        </div>
        <div class="movie-details">
          <h2 class="movie-title">{{ movie.title }}</h2>
          <p class="movie-tag"><i class="fas fa-tag"></i> {{ movie.tag }}</p>
          <p class="movie-meta"><strong>Genre:</strong> {{ movie.genre }}</p>
          <p class="movie-meta"><strong>Duration:</strong> {{ movie.duration }}</p>
          <p class="movie-meta"><strong>Language:</strong> {{ movie.language }}</p>
          <p class="movie-meta"><strong>Release Date:</strong> {{ movie.releaseDate }}</p>
          <p class="movie-synopsis">{{ movie.synopsis }}</p>
          <p class="movie-meta"><strong>Writer:</strong> {{ movie.writer }}</p>
          <p class="movie-meta"><strong>Producer:</strong> {{ movie.producer }}</p>
          <p class="movie-meta"><strong>Casts:</strong> {{ movie.casts }}</p>
          <p class="movie-meta"><strong>Director:</strong> {{ movie.director }}</p>
          <p class="movie-meta"><strong>Production Company:</strong> {{ movie.production }}</p>
        </div>
      </div>
      
      <!-- Comments Link on Movie Page -->
      <div class="comments-link" style="text-align:center; margin-top:1rem;">
        <router-link to="/comments">
          <button class="comments-button">
            <i class="fas fa-comments"></i> Comments
          </button>
          <p style="font-size:0.9rem; color:#555;">
            See what other people think of the movie (Reviews, Ratings, Opinion)
            <br>Over {{ commentCount }} People commented on this
          </p>
        </router-link>
      </div>
      
      <!-- Modal -->
      <transition enter-active-class="animate__animated animate__fadeInDown" leave-active-class="animate__animated animate__fadeOutUp">
        <div class="modal-overlay" v-if="showModal">
          <div class="modal-content">
            <img :src="movie.poster" alt="Movie Poster">
            <h3>{{ movie.title }}</h3>
            <p>
              Unlock the full cinematic experience! To watch this movie on your device, you need to rent it first.
              It costs just 1000 Naira (approx. $0.63) only. Rent now to dive into a mesmerizing animated adventure that transcends dimensions!
            </p>
            <div class="modal-buttons">
              <button class="rent-button" @click="trackRent">
                <i class="fas fa-ticket-alt"></i> Rent Now
              </button>
              <button class="dismiss-button" @click="closeModal">
                <i class="fas fa-times"></i> Dismiss
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `,
  data() {
    return {
      showModal: false,
      commentCount: 0,
      movie: {
        coverPoster: 'https://image.tmdb.org/t/p/original/shROD2YqREzo4TuonTsTVnnjpPC.jpg',
        poster: 'https://image.tmdb.org/t/p/original/l6eM38XDOO0IqsntxkOGJUkiKdA.jpg',
        title: 'Spider-Man: Into the Spider-Verse',
        tag: 'Any Spider Can Wear the Mask',
        genre: 'Animation, Action, Adventure',
        synopsis: 'Teen Miles Morales becomes Spider-Man in a groundbreaking animated adventure.',
        writer: 'Phil Lord, Rodney Rothman',
        producer: 'Phil Lord, Rodney Rothman',
        casts: 'Shameik Moore, Jake Johnson, Hailee Steinfeld, Mahershala Ali, Brian Tyree Henry',
        director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
        production: 'Columbia Pictures, Sony Pictures Animation',
        duration: '117 minutes',
        language: 'English',
        releaseDate: 'December 14, 2018'
      }
    };
  },
  created() {
    if (Cookies.get('Rent_Status') === 'Rented') {
      this.$router.push('/streaming');
    }
    // Track movie page view
    analytics.logEvent('page_view', {
      page_title: 'Movie Info Page',
      movie_title: this.movie.title,
      location: navigator.language,
      device: navigator.userAgent
    });
    // Get real-time count of comments
    db.collection("ElliotComments").onSnapshot(snapshot => {
      this.commentCount = snapshot.size;
    });
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    trackWatchNow() {
      this.showModal = true;
      analytics.logEvent('click_watch_now', {
        movie_title: this.movie.title,
        location: navigator.language,
        device: navigator.userAgent
      });
    },
    trackRent() {
      analytics.logEvent('click_rent_now', {
        movie_title: this.movie.title,
        location: navigator.language,
        device: navigator.userAgent
      });
      FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-02b9b5fc6406bd4a41c3ff141cc45e93-X",
        tx_ref: "txref-DI0NzMx13",
        amount: 1000,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        meta: { source: "rented-by-elliot" },
        customer: {
          email: "rentedbyelliot@gmail.com",
          phone_number: "08100000000",
          name: "Customer"
        },
        customizations: {
          title: "imaandworldflw",
          description: "Rent to watch Spider-Man: Into the Spider-Verse",
          logo: "https://checkout.flutterwave.com/assets/img/rave-logo.png"
        },
        callback: (data) => {
          if (data.status === "successful") {
            Cookies.set('Rent_Status', 'Rented', { expires: 20 });
            this.showToast("You Have successfully Rented this Film for the Next 20 Days, Enjoy.");
            setTimeout(() => {
              this.$router.push('/streaming');
            }, 2000);
          }
        },
        onclose: () => {
          console.log("Payment cancelled!");
        }
      });
      this.closeModal();
    },
    showToast(message) {
      let toast = document.createElement('div');
      toast.className = 'toast-message';
      toast.innerText = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  }
};

const StreamingPage = {
  template: `
    <div class="streaming-page">
      <div class="poster-wrapper" style="position: relative; display: inline-block;">
        <img :src="moviePoster" alt="Movie Poster" class="streaming-poster" />
        <button class="play-btn" @click="goToVideo">Play</button>
      </div>
      <p>You successfully rented this movie, available for the next 20 days, enjoy!</p>
      <!-- Comments Link on Streaming Page -->
      <div class="comments-link" style="text-align:center; margin-top:1rem;">
        <router-link to="/comments">
          <button class="comments-button">
            <i class="fas fa-comments"></i> Comments
          </button>
          <p style="font-size:0.9rem; color:#555;">
            Did you enjoy the movie, see what other people are saying about it (Reviews, Ratings and Comments)
            <br>Over {{ commentCount }} People commented on this
          </p>
        </router-link>
      </div>
    </div>
  `,
  data() {
    return {
      moviePoster: 'https://image.tmdb.org/t/p/original/l6eM38XDOO0IqsntxkOGJUkiKdA.jpg',
      commentCount: 0
    };
  },
  created() {
    if (Cookies.get('Rent_Status') !== 'Rented') {
      this.$router.push('/');
    }
    // Track streaming page view
    analytics.logEvent('streaming_page_view', {
      location: navigator.language,
      device: navigator.userAgent
    });
    // Get real-time count of comments
    db.collection("ElliotComments").onSnapshot(snapshot => {
      this.commentCount = snapshot.size;
    });
  },
  methods: {
    goToVideo() {
      analytics.logEvent('click_play_button', {
        location: navigator.language,
        device: navigator.userAgent
      });
      this.$router.push('/video');
    }
  }
};

const VideoPage = {
  template: `
    <div class="video-page">
      <video controls autoplay width="100%">
        <source src="path_to_movie_stream.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <!-- Comments Link on Video Page -->
      <div class="comments-link" style="text-align:center; margin-top:1rem;">
        <router-link to="/comments">
          <button class="comments-button">
            <i class="fas fa-comments"></i> Comments
          </button>
          <p style="font-size:0.9rem; color:#555;">
            Please leave a comment, review or rating, tell us what you think of the movie.
            <br>Over {{ commentCount }} People commented on this
          </p>
        </router-link>
      </div>
    </div>
  `,
  data() {
    return {
      commentCount: 0
    };
  },
  created() {
    if (Cookies.get('Rent_Status') !== 'Rented') {
      this.$router.push('/');
    }
    // Track video page view
    analytics.logEvent('video_page_view', {
      location: navigator.language,
      device: navigator.userAgent
    });
    // Get real-time count of comments
    db.collection("ElliotComments").onSnapshot(snapshot => {
      this.commentCount = snapshot.size;
    });
  }
};

const CommentsPage = {
  template: `
    <div class="comments-page">
      <h1>
        <i class="fas fa-edit"></i>Reviews.Ratings
      </h1>
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-name">{{ comment.name }}</span>
            <span class="comment-country">({{ comment.country }})</span>
            <span class="comment-timestamp" v-if="comment.timestamp">
              {{ comment.timestamp.toDate().toLocaleString() }}
            </span>
          </div>
          <div class="comment-rating">
            <span v-for="n in comment.rating" :key="n" class="fa fa-star" style="color: gold;"></span>
          </div>
          <div class="comment-body">
            {{ comment.comment }}
          </div>
          <div class="comment-like">
            <button @click="likeComment(comment)" class="like-button">
              <i :class="{'far fa-heart': !comment.liked, 'fas fa-heart': comment.liked}" style="color: red;"></i>
            </button>
            <span>{{ comment.likes || 0 }}</span>
          </div>
        </div>
      </div>
      <!-- Sticky Comment Button -->
      <button class="sticky-comment-btn" @click="openModal">Add Comment</button>
      
      <!-- Modal for New Comment -->
      <transition name="modal">
        <div class="modal-overlay" v-if="showModal">
          <div class="modal-content">
            <h2>Add Your Comment</h2>
            <form @submit.prevent="submitComment">
              <label>Name</label>
              <input type="text" v-model="newComment.name" required />
              <label>Country</label>
              <input type="text" v-model="newComment.country" required />
              <label>Rating (1-10)</label>
              <input type="number" v-model.number="newComment.rating" min="1" max="10" required />
              <label>Comment</label>
              <textarea v-model="newComment.comment" required></textarea>
              <button type="submit">Submit</button>
              <button type="button" @click="closeModal">Cancel</button>
            </form>
          </div>
        </div>
      </transition>
    </div>
  `,
  data() {
    return {
      comments: [],
      showModal: false,
      newComment: {
        name: '',
        country: '',
        rating: 1,
        comment: ''
      }
    };
  },
  created() {
    // Retrieve comments from Firestore "ElliotComments" and cache in localStorage
    db.collection("ElliotComments").orderBy("timestamp", "desc").onSnapshot(snapshot => {
      let commentsArr = [];
      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id;
        commentsArr.push(data);
      });
      this.comments = commentsArr;
      localStorage.setItem("ElliotComments", JSON.stringify(commentsArr));
    });
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    submitComment() {
      let commentData = {
        name: this.newComment.name,
        country: this.newComment.country,
        rating: this.newComment.rating,
        comment: this.newComment.comment,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0
      };
      db.collection("ElliotComments").add(commentData)
        .then(() => {
          this.closeModal();
          this.newComment = { name: '', country: '', rating: 1, comment: '' };
        })
        .catch(err => console.error("Error adding comment: ", err));
    },
    likeComment(comment) {
      let newLikes = (comment.likes || 0);
      if (!comment.liked) {
        newLikes++;
      } else {
        newLikes = Math.max(newLikes - 1, 0);
      }
      db.collection("ElliotComments").doc(comment.id).update({
        likes: newLikes
      })
      .then(() => {
        comment.likes = newLikes;
        comment.liked = !comment.liked;
      })
      .catch(err => console.error("Error updating like: ", err));
    }
  }
};

// Set up Vue Router with routes for the movie page, streaming page, video page, and comments page.
const routes = [
  { path: '/', component: MoviePage },
  { path: '/streaming', component: StreamingPage },
  { path: '/video', component: VideoPage },
  { path: '/comments', component: CommentsPage }
];

const router = new VueRouter({ routes });
new Vue({ router }).$mount('#app');