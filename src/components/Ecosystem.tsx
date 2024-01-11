import SeederDemo from "../assets/Seeder demo.svg"
import CherryDemoHeader from "../assets/cherry-demo-header.svg"
import CherryDemo from "../assets/cherry-demo.svg"
import CarbonPool from "../assets/carbon-pool.svg"
import Cherry from "../assets/cherry.svg"
import OpenConcept from "../assets/open-concept.svg"
import PeaceCell from "../assets/peace-cell.svg"
import Seeder from "../assets/seeder.svg"
import '../style/Ecosystem.css'

const ClickableImage = ({ src, alt, className, url }) => {

    const handleClick = () => {
        // Open the link in a new tab
        if (url) {
            window.open(url, '_blank');
        }
    };

    return (
        <img 
            src={src} 
            alt={alt} 
            className={`clickable-image ${className}`} 
            onClick={handleClick} 
        />
    );
};
const isMobile = window.innerWidth <= 768;

const Ecosystem: React.FC = () => {
    if(!isMobile)
    {
        return(
            <>
                <div className="ecosystem-container">
                    <div className="vision">
                        iamhuman emerges as a visionary ecosystem, meticulously crafted to empower humans to collectively shape the new earth - peace, environment, economy, politics and freedom. These global challenges, overwhelming for individuals alone, become achievable when tackled together. Until now, the pathway to meaningful collective action seemed elusive, but iamhuman changes that narrative.
                    </div>
                    <div className="seeder-demo">
                        <img src={SeederDemo} className="seeder-img"/>
                        <div className="demo-text">
                            Enter Seeder, a cutting-edge blockchain-peer-to-peer collaborative network that boldly reimagines traditional cloud technologies. In this innovative ecosystem, the need for conventional cloud services is eliminated. Individuals seeking to join the efforts become the cloud themselves, by installing the Seeder client on their devices, turning them into active nodes in the network, processing transactions in a way that generates a form of passive income. For each transaction independently fulfilled by a device, a fraction of the carbon offsets involved in the transaction is allocated to the Seeder. These carbon tokens, far from being mere symbols, carry real ecological and monetary value, allowing participants to sell them in the carbon pool to industries looking to offset their carbon footprints.
                            This ingenious model redistributes the economic benefits typically reserved for cloud service providers directly to the participants, seamlessly integrating ecological responsibility with tangible economic incentives.
                        </div>
                    </div>  
                    <div className="carbon-token-question">But where do these carbon tokens and transactions originate? This is where Cherry comes into play.</div>
                    <div className="cherry-demo">
                        <div className="row">
                            <div className="column">
                                <img src={CherryDemoHeader} className="cherry-img-header"/>
                                <div className="cherry-demo-text">
                                    Cherry plays a pivotal role in the iamhuman ecosystem, empowering urban residents to actively participate in transforming their living spaces. It provides a platform for residents to create and support their building hub, a collaborative venture that brings together the community in a shared goal of sustainability. Once established, these building hubs introduce their rooftops to a marketplace teeming with investors and farmers eagerly seeking spaces for energy and food production.
                                </div>
                            </div>
                            <img src={CherryDemo} className="cherry-img"/>
                        </div>
                    </div>
                    <div className="text">
                        This innovative approach allows for the creation of rooftop farms and renewable energy installations, directly benefiting the residents of the building. The produce generated—whether it be fresh produce from the farms or renewable energy—is sold to the residents, creating a self-sustaining micro-economy within buildings, neighborhoods, and cities. The revenue generated, along with the carbon offsets from each transaction, contribute significantly to urban sustainability. Making the city’s coverage greener(thus cooler) and its atmosphere leaner. These carbon offsets, representative of reduced greenhouse gas emissions, are a key element in the iamhuman ecosystem. They not only signify the environmental impact of each project but also form the basis of the transactions processed by Seeder. As such, each successful rooftop not only enhances the urban environment but also supports the broader ecological and economic goals of iamhuman.
                        Through Cherry, iamhuman facilitates a unique integration of community involvement, environmental stewardship, and economic benefit. This model demonstrates how urban spaces can be reimagined and repurposed to create a healthier, more sustainable living environment, directly involving and benefiting the residents who are part of it.
                    </div>
                    <img src={CarbonPool} className="carbon-pool-img"/>
                    <div className="text">
                        In the grand scheme of iamhuman, the carbon pool emerges as a critical component, bridging the gap between individual actions and broader industrial impact. This carbon pool is essentially an aggregation of the carbon offsets generated through Cherry's sustainable urban projects. Industries, constantly striving to mitigate their environmental impact, can tap into this pool to offset their carbon emissions. By purchasing carbon credits from this pool, industries not only comply with environmental regulations but also contribute to the cycle of sustainability fostered by iamhuman. Every purchase of carbon offsets not only supports the overarching goal of reducing global carbon emissions but also feeds back into the ecosystem, financially incentivizing the Seeder participants who play a pivotal role in maintaining the network. Thus, the carbon pool functions as a nexus where individual contributions to sustainability support larger industrial efforts towards ecological balance. In this way, IAMHuman encapsulates a holistic approach to environmental responsibility, connecting individuals, communities, and industries in a unified effort to forge a sustainable future.
                    </div>
                    <div className="coming-soon">
                    <ClickableImage src={PeaceCell} alt="Peace Cell" className="coming-soon-headline" url="https://peacecell.iamhuman.network/" />
                    <ClickableImage src={OpenConcept} alt="Open Concept" className="coming-soon-headline" url="https://openconcept.iamhuman.network/" />
                    <ClickableImage src={Cherry} alt="Cherry" className="coming-soon-headline-cherry" url="https://gocherry.network/" />
                    <ClickableImage src={Seeder} alt="Seeder" className="coming-soon-headline-seeder" url="https://seeder.iamhuman.network/" />
                    </div>
                    <div className="text">
                    The future with such a platform is bright, we can finally offer valuable solutions with low economic viability as they create value to the people who seed it, if people need it and want it, it can exist, as no cloud expenses are present. Which open a new world of possibilities, where we can finally attend to our dire needs as a society, to level up, create sustaining government mechanisms and applications that otherwise could not exist.
                    </div>
                    <div className="text">
                    iamhuman, through its innovative ecosystem comprising Seeder and Cherry, heralds a future brimming with potential and promise. This platform stands as a beacon of change, offering valuable solutions previously hindered by economic constraints. By eliminating the need for costly cloud services and redistributing value to those who power the network – the people – iamhuman opens a new realm of possibilities. In this future, the viability of a solution is directly linked to its necessity and desirability within the community. This shift ushers in an era where societal needs can be addressed more effectively, enabling the development of sustainable government mechanisms and applications that were once deemed unfeasible.
                    With iamhuman, we are not just looking at a technological revolution; we are witnessing a societal transformation. It's a world where our collective needs and aspirations drive innovation, where each individual's contribution lays the foundation for a more balanced and equitable society. This ecosystem empowers us to transcend traditional barriers, fostering an environment where we can collectively level up, addressing our most pressing challenges with newfound agility and collaboration. iamhuman is not just about building a sustainable future; it's about reimagining how we come together as a society to meet our needs, dream big, and turn those dreams into reality.
                    </div>
                </div>
            </>
        );
    }
    else{
        return (
            <>
            <div className="ecosystem-container">
                    <div className="vision">
                        iamhuman emerges as a visionary ecosystem, meticulously crafted to empower humans to collectively shape the new earth - peace, environment, economy, politics and freedom. These global challenges, overwhelming for individuals alone, become achievable when tackled together. Until now, the pathway to meaningful collective action seemed elusive, but iamhuman changes that narrative.
                    </div>
                    <img src={SeederDemo} className="seeder-img"/>
                    <div className="demo-text">
                        Enter Seeder, a cutting-edge blockchain-peer-to-peer collaborative network that boldly reimagines traditional cloud technologies. In this innovative ecosystem, the need for conventional cloud services is eliminated. Individuals seeking to join the efforts become the cloud themselves, by installing the Seeder client on their devices, turning them into active nodes in the network, processing transactions in a way that generates a form of passive income. For each transaction independently fulfilled by a device, a fraction of the carbon offsets involved in the transaction is allocated to the Seeder. These carbon tokens, far from being mere symbols, carry real ecological and monetary value, allowing participants to sell them in the carbon pool to industries looking to offset their carbon footprints.
                        This ingenious model redistributes the economic benefits typically reserved for cloud service providers directly to the participants, seamlessly integrating ecological responsibility with tangible economic incentives.
                    </div>  
                    <div className="carbon-token-question">But where do these carbon tokens and transactions originate? This is where Cherry comes into play.</div>
                    <img src={CherryDemoHeader} className="cherry-img-header"/>
                    <div className="cherry-demo-text">
                        Cherry plays a pivotal role in the iamhuman ecosystem, empowering urban residents to actively participate in transforming their living spaces. It provides a platform for residents to create and support their building hub, a collaborative venture that brings together the community in a shared goal of sustainability. Once established, these building hubs introduce their rooftops to a marketplace teeming with investors and farmers eagerly seeking spaces for energy and food production.
                    </div>
                    <img src={CherryDemo} className="cherry-img"/>
                    <div className="text">
                        This innovative approach allows for the creation of rooftop farms and renewable energy installations, directly benefiting the residents of the building. The produce generated—whether it be fresh produce from the farms or renewable energy—is sold to the residents, creating a self-sustaining micro-economy within buildings, neighborhoods, and cities. The revenue generated, along with the carbon offsets from each transaction, contribute significantly to urban sustainability. Making the city’s coverage greener(thus cooler) and its atmosphere leaner. These carbon offsets, representative of reduced greenhouse gas emissions, are a key element in the iamhuman ecosystem. They not only signify the environmental impact of each project but also form the basis of the transactions processed by Seeder. As such, each successful rooftop not only enhances the urban environment but also supports the broader ecological and economic goals of iamhuman.
                        Through Cherry, iamhuman facilitates a unique integration of community involvement, environmental stewardship, and economic benefit. This model demonstrates how urban spaces can be reimagined and repurposed to create a healthier, more sustainable living environment, directly involving and benefiting the residents who are part of it.
                    </div>
                    <img src={CarbonPool} className="carbon-pool-img"/>
                    <div className="text">
                        In the grand scheme of iamhuman, the carbon pool emerges as a critical component, bridging the gap between individual actions and broader industrial impact. This carbon pool is essentially an aggregation of the carbon offsets generated through Cherry's sustainable urban projects. Industries, constantly striving to mitigate their environmental impact, can tap into this pool to offset their carbon emissions. By purchasing carbon credits from this pool, industries not only comply with environmental regulations but also contribute to the cycle of sustainability fostered by iamhuman. Every purchase of carbon offsets not only supports the overarching goal of reducing global carbon emissions but also feeds back into the ecosystem, financially incentivizing the Seeder participants who play a pivotal role in maintaining the network. Thus, the carbon pool functions as a nexus where individual contributions to sustainability support larger industrial efforts towards ecological balance. In this way, IAMHuman encapsulates a holistic approach to environmental responsibility, connecting individuals, communities, and industries in a unified effort to forge a sustainable future.
                    </div>
                    <ClickableImage src={PeaceCell} alt="Peace Cell" className="coming-soon-headline" url="https://peacecell.iamhuman.network/" />
                    <ClickableImage src={OpenConcept} alt="Open Concept" className="coming-soon-headline" url="https://openconcept.iamhuman.network/" />
                    <ClickableImage src={Cherry} alt="Cherry" className="coming-soon-headline-cherry" url="https://gocherry.network/" />
                    <ClickableImage src={Seeder} alt="Seeder" className="coming-soon-headline-seeder" url="https://seeder.iamhuman.network/" />
                    <div className="text">
                    The future with such a platform is bright, we can finally offer valuable solutions with low economic viability as they create value to the people who seed it, if people need it and want it, it can exist, as no cloud expenses are present. Which open a new world of possibilities, where we can finally attend to our dire needs as a society, to level up, create sustaining government mechanisms and applications that otherwise could not exist.
                    </div>
                    <div className="text">
                    iamhuman, through its innovative ecosystem comprising Seeder and Cherry, heralds a future brimming with potential and promise. This platform stands as a beacon of change, offering valuable solutions previously hindered by economic constraints. By eliminating the need for costly cloud services and redistributing value to those who power the network – the people – iamhuman opens a new realm of possibilities. In this future, the viability of a solution is directly linked to its necessity and desirability within the community. This shift ushers in an era where societal needs can be addressed more effectively, enabling the development of sustainable government mechanisms and applications that were once deemed unfeasible.
                    With iamhuman, we are not just looking at a technological revolution; we are witnessing a societal transformation. It's a world where our collective needs and aspirations drive innovation, where each individual's contribution lays the foundation for a more balanced and equitable society. This ecosystem empowers us to transcend traditional barriers, fostering an environment where we can collectively level up, addressing our most pressing challenges with newfound agility and collaboration. iamhuman is not just about building a sustainable future; it's about reimagining how we come together as a society to meet our needs, dream big, and turn those dreams into reality.
                    </div>
                </div>
            </>
        );
    }
}
export default Ecosystem;