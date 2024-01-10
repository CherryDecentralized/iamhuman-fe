import Speech from "./Speech";
import SubmissionForm from "./SubmissionForm";
import '../style/Home.css';
import SocialMediaBar from "./SocialMediaComponent";


const Home: React.FC = () => {
    const onSubmitPledge = (pledgeData: { firstName: string; email: string; subject: string }) => {
        
    };

    return(
    <div className="Home">
        <div className="speech-container">
          <Speech />
        </div>
        
        <div className="signup-container">
          <SubmissionForm onSubmitPledge={onSubmitPledge} />
        </div>

        <div className="gathering">
            We are currently gathering! join us and share with your friends
        </div> 

        <div className="social-media">
          <SocialMediaBar />
        </div>

        <div className="intro-text">
          Gaze upon our beautiful planet, a tapestry of cultures, ideas, and aspirations. Here at iamhuman, we stand at the forefront of a digital renaissance, a collective pledge by people from every corner of the Earth to reclaim our earth. Our mission transcends borders and connects hearts, fostering an ecosystem where freedom, collaboration, and innovation aren't just ideals, but the very pillars of our existence. As you witness the globe alight with the souls who have joined this movement, remember that each light represents a voice, a hope, a commitment to a future where we, as a global family, shape a realm as diverse and beautiful as the Earth itself. Together, we are not just users of a network; we are the architects of our destiny. Join us, and be part of this extraordinary journey towards a world where every human being can proudly say: “I Am Free”
        </div>
    </div>
    );
}

export default Home;