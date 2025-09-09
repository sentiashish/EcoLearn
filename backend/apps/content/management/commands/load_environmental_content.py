from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.content.models import Category, Lesson, Quiz, Question, Answer
from apps.challenges.models import Challenge
from django.utils.text import slugify
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Load comprehensive environmental education content'

    def handle(self, *args, **options):
        self.stdout.write('Loading environmental education content...')
        
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@ecolearn.com',
            defaults={
                'first_name': 'EcoLearn',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')
        
        # Create categories
        categories_data = [
            {
                'name': 'Climate Change',
                'description': 'Understanding climate science, impacts, and solutions',
                'icon': '🌡️',
                'color': '#ef4444'
            },
            {
                'name': 'Renewable Energy',
                'description': 'Solar, wind, hydro and other clean energy technologies',
                'icon': '⚡',
                'color': '#f59e0b'
            },
            {
                'name': 'Sustainability',
                'description': 'Sustainable living practices and circular economy',
                'icon': '♻️',
                'color': '#10b981'
            },
            {
                'name': 'Biodiversity',
                'description': 'Ecosystems, conservation, and wildlife protection',
                'icon': '🌿',
                'color': '#059669'
            },
            {
                'name': 'Pollution Control',
                'description': 'Air, water, and soil pollution prevention and remediation',
                'icon': '🏭',
                'color': '#6366f1'
            },
            {
                'name': 'Green Technology',
                'description': 'Innovation and technology for environmental solutions',
                'icon': '🔬',
                'color': '#8b5cf6'
            }
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'slug': slugify(cat_data['name']),
                    'description': cat_data['description'],
                    'icon': cat_data['icon'],
                    'color': cat_data['color'],
                    'is_active': True
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {cat_data["name"]}')
        
        # Create comprehensive lessons
        lessons_data = [
            # Climate Change Lessons
            {
                'title': 'Climate Science Fundamentals',
                'category': 'Climate Change',
                'difficulty': 'beginner',
                'content_type': 'article',
                'description': 'Understanding the greenhouse effect, carbon cycle, and climate systems',
                'content': '''# Climate Science Fundamentals

## The Greenhouse Effect

The greenhouse effect is a natural process that warms Earth's surface. When the Sun's energy reaches Earth, some of it is reflected back to space and the rest is absorbed and re-radiated by greenhouse gases.

### Key Greenhouse Gases:
- **Carbon Dioxide (CO₂)**: 76% of emissions
- **Methane (CH₄)**: 16% of emissions
- **Nitrous Oxide (N₂O)**: 6% of emissions
- **Fluorinated gases**: 2% of emissions

## The Carbon Cycle

The carbon cycle describes how carbon moves between the atmosphere, oceans, land, and living organisms:

1. **Photosynthesis**: Plants absorb CO₂ from the atmosphere
2. **Respiration**: Living organisms release CO₂ back to the atmosphere
3. **Ocean absorption**: Oceans absorb about 25% of human CO₂ emissions
4. **Fossil fuel combustion**: Releases stored carbon into the atmosphere

## Climate vs Weather

- **Weather**: Short-term atmospheric conditions (days to weeks)
- **Climate**: Long-term weather patterns (30+ years)

## Evidence of Climate Change

### Temperature Records
- Global average temperature has risen by 1.1°C since pre-industrial times
- The last decade was the warmest on record
- Arctic warming is occurring twice as fast as the global average

### Physical Indicators
- Sea level rise: 21-24 cm since 1880
- Arctic sea ice decline: 13% per decade
- Glacier retreat worldwide
- Ocean acidification: 30% increase since pre-industrial times

## Climate Feedback Loops

### Positive Feedback (Amplifying)
- **Ice-albedo feedback**: Less ice → more heat absorption → more melting
- **Permafrost thaw**: Releases stored carbon → more warming

### Negative Feedback (Stabilizing)
- **Cloud formation**: More evaporation → more clouds → cooling effect
- **Carbon fertilization**: Higher CO₂ → enhanced plant growth

## Conclusion

Understanding climate science is crucial for addressing the climate crisis. The evidence clearly shows that human activities are driving unprecedented changes to Earth's climate system.''',
                'estimated_duration': 25,
                'points_reward': 50,
                'video_url': 'https://www.youtube.com/watch?v=oJAbATJCugs'
            },
            {
                'title': 'Climate Impacts and Adaptation',
                'category': 'Climate Change',
                'difficulty': 'intermediate',
                'content_type': 'interactive',
                'description': 'Exploring climate change impacts on ecosystems, agriculture, and human societies',
                'content': '''# Climate Impacts and Adaptation

## Physical Impacts

### Temperature Changes
- **Heat waves**: More frequent and intense extreme heat events
- **Cold snaps**: Less frequent but potentially more severe when they occur
- **Growing seasons**: Extended in some regions, disrupted in others

### Precipitation Patterns
- **Droughts**: Increased frequency and severity in many regions
- **Flooding**: More intense precipitation events
- **Snow and ice**: Earlier snowmelt, reduced snowpack

### Sea Level Rise
- **Coastal erosion**: Threatening infrastructure and communities
- **Saltwater intrusion**: Contaminating freshwater supplies
- **Storm surge**: Increased flooding during storms

## Ecosystem Impacts

### Terrestrial Ecosystems
- **Forest fires**: Increased frequency and intensity
- **Species migration**: Shifts in habitat ranges
- **Phenological changes**: Altered timing of biological events

### Marine Ecosystems
- **Ocean acidification**: Threatening coral reefs and shellfish
- **Marine heatwaves**: Causing coral bleaching
- **Fish migration**: Changes in fish distribution

### Arctic Changes
- **Permafrost thaw**: Releasing greenhouse gases
- **Habitat loss**: Polar bear and seal populations at risk
- **Indigenous communities**: Traditional ways of life threatened

## Human System Impacts

### Agriculture
- **Crop yields**: Variable impacts depending on region and crop
- **Water stress**: Increased irrigation needs
- **Pest and disease**: New challenges for farmers

### Health
- **Heat-related illness**: Increased mortality during heat waves
- **Vector-borne diseases**: Expanded range of disease vectors
- **Air quality**: Worsened by increased wildfires and heat

### Infrastructure
- **Transportation**: Roads, railways, and airports at risk
- **Energy systems**: Increased cooling demand, grid stress
- **Buildings**: Structural damage from extreme weather

## Vulnerable Populations

### Geographic Vulnerability
- **Small island states**: Existential threat from sea level rise
- **Arctic communities**: Rapid environmental changes
- **Arid regions**: Increased water scarcity

### Social Vulnerability
- **Low-income communities**: Limited adaptive capacity
- **Indigenous peoples**: Traditional knowledge and lands threatened
- **Children and elderly**: Higher health risks

## Adaptation Strategies

### Ecosystem-based Adaptation
- **Wetland restoration**: Natural flood protection
- **Reforestation**: Carbon sequestration and erosion control
- **Coral reef protection**: Maintaining marine biodiversity

### Infrastructure Adaptation
- **Sea walls and levees**: Coastal protection
- **Green infrastructure**: Sustainable urban drainage
- **Climate-resilient buildings**: Design for extreme weather

### Agricultural Adaptation
- **Drought-resistant crops**: Genetic modification and breeding
- **Precision agriculture**: Efficient water and nutrient use
- **Crop diversification**: Reducing risk through variety

### Social Adaptation
- **Early warning systems**: Preparing for extreme events
- **Climate education**: Building awareness and capacity
- **Migration planning**: Managed retreat from high-risk areas

## Case Studies

### Netherlands Delta Works
Comprehensive flood protection system including:
- Storm surge barriers
- Dikes and dams
- Water storage areas
- Room for the River program

### Singapore Water Security
- Desalination plants
- Water recycling (NEWater)
- Rainwater harvesting
- Demand management

### Bangladesh Floating Agriculture
- Floating gardens for flood-prone areas
- Traditional knowledge adaptation
- Climate-resilient food production

## Conclusion

Climate adaptation is essential for reducing vulnerability and building resilience. Successful adaptation requires:
- Understanding local climate risks
- Engaging vulnerable communities
- Integrating traditional and scientific knowledge
- Building adaptive capacity
- Monitoring and evaluation''',
                'estimated_duration': 35,
                'points_reward': 75
            },
            # Renewable Energy Lessons
            {
                'title': 'Solar Energy Technology',
                'category': 'Renewable Energy',
                'difficulty': 'intermediate',
                'content_type': 'video',
                'description': 'Comprehensive guide to photovoltaic and thermal solar technologies',
                'content': '''# Solar Energy Technology

## Introduction to Solar Energy

Solar energy is the most abundant energy resource on Earth. Every hour, the sun delivers more energy to Earth than humanity uses in an entire year. Harnessing this energy is key to a sustainable future.

## Types of Solar Technology

### Photovoltaic (PV) Systems
Convert sunlight directly into electricity using semiconductor materials.

#### Silicon-based PV Cells
- **Monocrystalline**: Highest efficiency (20-22%), most expensive
- **Polycrystalline**: Good efficiency (15-17%), moderate cost
- **Amorphous**: Lower efficiency (6-8%), lowest cost, flexible

#### Thin-film Technologies
- **Cadmium Telluride (CdTe)**: Cost-effective for utility-scale
- **Copper Indium Gallium Selenide (CIGS)**: High efficiency potential
- **Organic PV**: Emerging technology, flexible applications

### Solar Thermal Systems
Use sunlight to generate heat for various applications.

#### Solar Water Heating
- **Flat plate collectors**: Most common residential application
- **Evacuated tube collectors**: Better performance in cold climates
- **Integral collector-storage**: Simple, passive systems

#### Concentrated Solar Power (CSP)
- **Parabolic trough**: Most mature CSP technology
- **Solar power tower**: High-temperature applications
- **Dish/engine systems**: Modular, distributed generation
- **Linear Fresnel**: Lower cost alternative to parabolic trough

## How Solar PV Works

### The Photovoltaic Effect
1. **Photon absorption**: Solar cell absorbs photons from sunlight
2. **Electron excitation**: Photons knock electrons loose from atoms
3. **Charge separation**: Electric field separates positive and negative charges
4. **Current flow**: Electrons flow through external circuit

### System Components

#### Solar Panels
- **Cells**: Individual PV units (typically 6" x 6")
- **Modules**: Groups of cells in weatherproof package
- **Arrays**: Multiple modules connected together

#### Balance of System
- **Inverters**: Convert DC to AC electricity
- **Mounting systems**: Secure panels to roof or ground
- **Monitoring systems**: Track performance and issues
- **Safety equipment**: Disconnects, grounding, surge protection

## Solar System Design

### Site Assessment
- **Solar resource**: Annual solar irradiation levels
- **Shading analysis**: Trees, buildings, other obstructions
- **Roof condition**: Age, material, structural capacity
- **Electrical system**: Panel capacity, upgrade needs

### System Sizing
- **Energy consumption**: Historical electricity usage
- **Available space**: Roof area or ground space
- **Budget constraints**: Upfront investment capacity
- **Grid connection**: Net metering policies

### Installation Considerations
- **Orientation**: South-facing optimal in Northern Hemisphere
- **Tilt angle**: Typically equals latitude for maximum annual production
- **Spacing**: Avoid inter-row shading
- **Accessibility**: Maintenance and cleaning access

## Economic Aspects

### Cost Trends
- Solar PV costs have dropped 90% since 2010
- Utility-scale solar now cost-competitive with fossil fuels
- Residential solar payback periods: 6-10 years in most markets

### Financial Incentives
- **Federal tax credits**: 30% Investment Tax Credit (ITC)
- **State rebates**: Vary by location
- **Net metering**: Sell excess power back to grid
- **Solar renewable energy certificates (SRECs)**: Additional revenue stream

### Financing Options
- **Cash purchase**: Highest long-term savings
- **Solar loans**: Spread cost over time
- **Solar leases**: Lower upfront cost, less savings
- **Power purchase agreements (PPAs)**: Pay for solar electricity

## Environmental Benefits

### Greenhouse Gas Reduction
- Solar PV: 40-50g CO₂/kWh (vs 820g for coal)
- Payback energy investment in 1-4 years
- 25+ year lifespan provides decades of clean energy

### Other Environmental Impacts
- **Water use**: Minimal compared to thermal power plants
- **Land use**: Can be combined with agriculture (agrivoltaics)
- **Materials**: Recyclable at end of life

## Challenges and Solutions

### Intermittency
- **Battery storage**: Store excess energy for later use
- **Grid integration**: Smart grid technologies
- **Demand response**: Shift electricity use to sunny periods

### Grid Integration
- **Voltage regulation**: Managing distributed generation
- **Frequency control**: Maintaining grid stability
- **Forecasting**: Predicting solar output

### Manufacturing
- **Supply chain**: Reducing dependence on single countries
- **Recycling**: End-of-life panel management
- **Materials**: Reducing use of rare elements

## Future Developments

### Technology Advances
- **Perovskite cells**: Potential for higher efficiency, lower cost
- **Bifacial panels**: Generate power from both sides
- **Floating solar**: Installations on water bodies
- **Building-integrated PV**: Solar windows and facades

### Market Trends
- **Utility-scale growth**: Largest segment of new capacity
- **Distributed generation**: Rooftop and community solar
- **Energy storage integration**: Solar + battery systems
- **Electric vehicle charging**: Solar-powered transportation

## Conclusion

Solar energy technology has matured rapidly and is now a cornerstone of the clean energy transition. Continued innovation and deployment will drive further cost reductions and performance improvements, making solar an increasingly attractive option for meeting our energy needs sustainably.''',
                'estimated_duration': 40,
                'points_reward': 80,
                'video_url': 'https://www.youtube.com/watch?v=xKxrkht7CpY'
            },
            # Sustainability Lessons
            {
                'title': 'Circular Economy Principles',
                'category': 'Sustainability',
                'difficulty': 'intermediate',
                'content_type': 'interactive',
                'description': 'Understanding circular economy models and sustainable business practices',
                'content': '''# Circular Economy Principles

## Introduction

The circular economy is a model of production and consumption that involves sharing, leasing, reusing, repairing, refurbishing, and recycling existing materials and products for as long as possible. This approach contrasts with the traditional linear economy's "take-make-dispose" model.

## Linear vs Circular Economy

### Linear Economy (Take-Make-Dispose)
- Extract raw materials
- Manufacture products
- Use products
- Dispose of waste
- **Problems**: Resource depletion, waste accumulation, environmental degradation

### Circular Economy
- Design out waste and pollution
- Keep products and materials in use
- Regenerate natural systems
- **Benefits**: Resource efficiency, reduced waste, economic opportunities

## Core Principles

### 1. Design Out Waste and Pollution
- **Design for durability**: Products that last longer
- **Design for disassembly**: Easy to repair and recycle
- **Material selection**: Non-toxic, renewable materials
- **Modular design**: Components can be upgraded or replaced

### 2. Keep Products and Materials in Use
- **Sharing platforms**: Maximize utilization of products
- **Product-as-a-Service**: Lease instead of sell
- **Remanufacturing**: Restore products to like-new condition
- **Upcycling**: Transform waste into higher-value products

### 3. Regenerate Natural Systems
- **Biomimicry**: Learn from nature's designs
- **Renewable energy**: Power systems with clean energy
- **Carbon sequestration**: Store carbon in soils and forests
- **Biodiversity protection**: Maintain ecosystem health

## The R-Hierarchy

### Refuse
- Avoid unnecessary consumption
- Question: "Do I really need this?"
- Examples: Digital receipts, reusable bags

### Reduce
- Minimize resource consumption
- Efficiency improvements
- Examples: Energy-efficient appliances, smaller packaging

### Reuse
- Use products for their original purpose multiple times
- Examples: Glass jars for storage, clothing donation

### Repair
- Fix broken products instead of replacing
- Right to repair movement
- Examples: Smartphone repair, appliance maintenance

### Refurbish
- Restore products to working condition
- Often involves updating or improving
- Examples: Refurbished electronics, furniture restoration

### Remanufacture
- Disassemble and rebuild products to original specifications
- Industrial process with quality standards
- Examples: Automotive parts, office equipment

### Repurpose
- Use products for different purposes
- Creative adaptation
- Examples: Tire planters, pallet furniture

### Recycle
- Process materials into new products
- Last resort before disposal
- Examples: Paper recycling, metal recovery

### Recover
- Extract energy or materials from waste
- Energy recovery from non-recyclable waste
- Examples: Waste-to-energy, composting

## Business Models

### Product-as-a-Service (PaaS)
- **Concept**: Customers pay for service, not product ownership
- **Examples**: 
  - Philips "Light as a Service"
  - Rolls-Royce "Power by the Hour"
  - Car sharing services
- **Benefits**: Incentivizes durability, reduces customer risk

### Sharing Economy
- **Concept**: Maximize utilization of underused assets
- **Examples**:
  - Airbnb (accommodation)
  - Uber/Lyft (transportation)
  - Tool libraries
- **Benefits**: Reduced resource needs, increased access

### Resource Recovery
- **Concept**: Extract value from waste streams
- **Examples**:
  - Waste-to-energy plants
  - Material recovery facilities
  - Industrial symbiosis
- **Benefits**: Waste reduction, new revenue streams

### Modular Design
- **Concept**: Products designed with interchangeable components
- **Examples**:
  - Fairphone (modular smartphone)
  - Modular furniture systems
  - Standardized building components
- **Benefits**: Easy repair, upgrade, customization

## Implementation Strategies

### For Businesses

#### Assessment and Planning
1. **Material flow analysis**: Map resource flows
2. **Waste audit**: Identify waste streams
3. **Stakeholder engagement**: Involve suppliers and customers
4. **Business case development**: Quantify benefits

#### Design and Development
1. **Circular design principles**: Integrate from the start
2. **Life cycle assessment**: Evaluate environmental impacts
3. **Collaboration**: Work with suppliers and partners
4. **Pilot projects**: Test concepts before full implementation

#### Operations and Management
1. **Supply chain optimization**: Circular procurement
2. **Employee training**: Build circular economy skills
3. **Performance metrics**: Track circular indicators
4. **Continuous improvement**: Iterate and optimize

### For Consumers

#### Purchasing Decisions
- **Buy less**: Focus on needs vs wants
- **Buy better**: Choose durable, repairable products
- **Buy local**: Reduce transportation impacts
- **Buy certified**: Look for sustainability certifications

#### Usage Patterns
- **Maintain products**: Regular care extends lifespan
- **Share resources**: Borrow, lend, or rent when possible
- **Repair first**: Fix before replacing
- **Proper disposal**: Recycle or donate when done

## Case Studies

### Interface Inc. (Carpet Manufacturer)
- **Mission Zero**: Eliminate environmental footprint by 2020
- **Carbon negative**: Sequester more carbon than emitted
- **Closed-loop recycling**: Old carpets become new carpets
- **Results**: 96% reduction in carbon intensity

### Patagonia (Outdoor Clothing)
- **Worn Wear**: Repair and resale program
- **1% for the Planet**: Donate profits to environmental causes
- **Recycled materials**: Use recycled polyester and down
- **Don't Buy This Jacket**: Campaign to reduce consumption

### Kalundborg Industrial Symbiosis (Denmark)
- **Concept**: Industrial ecosystem where waste from one becomes input for another
- **Participants**: Power plant, refinery, pharmaceutical companies
- **Benefits**: Reduced waste, lower costs, job creation
- **Results**: 50+ years of successful operation

### Ellen MacArthur Foundation
- **Mission**: Accelerate transition to circular economy
- **Programs**: Research, education, business engagement
- **Impact**: Global thought leadership, policy influence
- **Network**: 1000+ organizations committed to circular economy

## Challenges and Barriers

### Economic Barriers
- **Upfront costs**: Higher initial investment for circular solutions
- **Market failures**: Externalities not priced in
- **Financial systems**: Short-term focus vs long-term benefits

### Technical Barriers
- **Technology gaps**: Some circular solutions not yet viable
- **Infrastructure**: Lack of recycling and remanufacturing facilities
- **Standards**: Need for common specifications and protocols

### Social Barriers
- **Consumer behavior**: Preference for new products
- **Skills gap**: Need for new competencies
- **Cultural norms**: Status associated with ownership

### Policy Barriers
- **Regulatory frameworks**: Designed for linear economy
- **Incentive structures**: Subsidies favor resource extraction
- **International coordination**: Need for global standards

## Policy Support

### Regulatory Measures
- **Extended producer responsibility**: Manufacturers responsible for product lifecycle
- **Right to repair**: Legal requirements for repairability
- **Waste prevention targets**: Mandatory reduction goals
- **Material disclosure**: Transparency in product composition

### Economic Instruments
- **Carbon pricing**: Internalize environmental costs
- **Tax shifts**: From labor to resource use
- **Green procurement**: Government purchasing power
- **Innovation funding**: Support for circular technologies

### Information and Education
- **Labeling schemes**: Help consumers make informed choices
- **Education programs**: Build circular economy awareness
- **Best practice sharing**: Facilitate knowledge transfer
- **Research and development**: Advance circular solutions

## Future Outlook

### Technology Trends
- **Digital technologies**: IoT, blockchain for tracking materials
- **Advanced materials**: Bio-based and biodegradable options
- **Automation**: Robotics for disassembly and sorting
- **Artificial intelligence**: Optimize resource flows

### Market Developments
- **Growing awareness**: Increased consumer and business interest
- **Investment flows**: More capital directed to circular solutions
- **Policy momentum**: Governments adopting circular strategies
- **Global cooperation**: International initiatives and agreements

### Potential Impact
- **Economic benefits**: $4.5 trillion in economic benefits by 2030
- **Job creation**: Millions of new jobs in circular sectors
- **Environmental benefits**: Significant reduction in resource use and emissions
- **Social benefits**: More equitable access to goods and services

## Conclusion

The circular economy represents a fundamental shift in how we think about production and consumption. By designing out waste, keeping materials in use, and regenerating natural systems, we can create a more sustainable and resilient economic system. Success requires collaboration across all sectors of society and a commitment to long-term thinking over short-term gains.''',
                'estimated_duration': 45,
                'points_reward': 90
            },
            # Biodiversity Lessons
            {
                'title': 'Ecosystem Conservation Strategies',
                'category': 'Biodiversity',
                'difficulty': 'advanced',
                'content_type': 'case_study',
                'description': 'Advanced strategies for protecting and restoring ecosystems worldwide',
                'content': '''# Ecosystem Conservation Strategies

## Introduction

Ecosystem conservation is critical for maintaining biodiversity, supporting human well-being, and ensuring the stability of Earth's life support systems. This lesson explores comprehensive strategies for protecting and restoring ecosystems at local, national, and global scales.

## Understanding Ecosystems

### Ecosystem Components
- **Biotic factors**: Living organisms (plants, animals, microorganisms)
- **Abiotic factors**: Non-living elements (climate, soil, water, nutrients)
- **Interactions**: Complex relationships between all components

### Ecosystem Services

#### Provisioning Services
- **Food**: Crops, livestock, fisheries, wild foods
- **Fresh water**: Rivers, lakes, aquifers
- **Fiber**: Timber, cotton, hemp, silk
- **Genetic resources**: Medicinal plants, crop varieties
- **Biochemicals**: Natural medicines, industrial compounds
- **Energy**: Hydropower, biomass, wind

#### Regulating Services
- **Climate regulation**: Carbon sequestration, temperature moderation
- **Water regulation**: Flood control, drought mitigation
- **Disease control**: Natural pest control, pathogen regulation
- **Pollination**: Crop and wild plant reproduction
- **Water purification**: Filtration, detoxification
- **Air quality**: Pollution absorption, oxygen production

#### Cultural Services
- **Spiritual values**: Sacred sites, religious significance
- **Recreation**: Ecotourism, outdoor activities
- **Aesthetic values**: Natural beauty, inspiration
- **Educational value**: Research, traditional knowledge
- **Cultural heritage**: Traditional practices, identity

#### Supporting Services
- **Primary production**: Photosynthesis, chemosynthesis
- **Nutrient cycling**: Carbon, nitrogen, phosphorus cycles
- **Soil formation**: Weathering, organic matter decomposition
- **Oxygen production**: Photosynthesis by plants and algae

## Threats to Ecosystems

### Direct Drivers

#### Habitat Loss and Fragmentation
- **Deforestation**: 10 million hectares lost annually
- **Urbanization**: Expanding cities and infrastructure
- **Agriculture**: Conversion to farmland
- **Mining**: Extraction of minerals and fossil fuels

#### Overexploitation
- **Overfishing**: 34% of fish stocks overexploited
- **Hunting**: Illegal wildlife trade worth $20 billion annually
- **Logging**: Unsustainable forest harvesting
- **Water extraction**: Depletion of aquifers and rivers

#### Pollution
- **Chemical pollution**: Pesticides, industrial chemicals
- **Plastic pollution**: 8 million tons enter oceans annually
- **Nutrient pollution**: Eutrophication from agriculture
- **Light pollution**: Disrupts nocturnal species
- **Noise pollution**: Affects animal communication

#### Climate Change
- **Temperature rise**: Shifting species ranges
- **Precipitation changes**: Altering water availability
- **Sea level rise**: Coastal habitat loss
- **Ocean acidification**: Threatening marine ecosystems
- **Extreme weather**: Increased frequency and intensity

#### Invasive Species
- **Introduction pathways**: Trade, transport, tourism
- **Economic impact**: $120 billion annually in US alone
- **Ecological impact**: Competition, predation, disease
- **Examples**: Zebra mussels, Asian carp, kudzu vine

### Indirect Drivers
- **Population growth**: Increasing resource demands
- **Economic systems**: Short-term profit focus
- **Governance**: Weak environmental regulations
- **Technology**: Both solutions and problems
- **Cultural values**: Disconnection from nature

## Conservation Strategies

### Protected Areas

#### Types of Protected Areas
- **Strict nature reserves**: No human intervention
- **National parks**: Conservation with recreation
- **Natural monuments**: Protect specific features
- **Habitat/species management areas**: Active management
- **Protected landscapes**: Sustainable use
- **Sustainable use areas**: Multiple use management

#### Design Principles
- **Size**: Larger areas support more species
- **Shape**: Circular shapes minimize edge effects
- **Connectivity**: Corridors link fragmented habitats
- **Representation**: Include all ecosystem types
- **Replication**: Multiple examples of each ecosystem

#### Global Targets
- **Aichi Target 11**: 17% of terrestrial, 10% of marine areas
- **30x30 Initiative**: 30% protection by 2030
- **Current status**: 15% terrestrial, 7% marine protected

### Landscape-Scale Conservation

#### Corridor Conservation
- **Wildlife corridors**: Connect fragmented habitats
- **Riparian buffers**: Protect waterways
- **Stepping stones**: Small habitat patches
- **Examples**: Yellowstone to Yukon, European Green Belt

#### Watershed Management
- **Integrated approach**: Entire watershed as unit
- **Multiple stakeholders**: Coordinate across boundaries
- **Water quality**: Protect source to sea
- **Flood management**: Natural flood management

#### Transboundary Conservation
- **Peace parks**: Conservation across borders
- **Migratory species**: Protect entire migration routes
- **Shared ecosystems**: Coordinate management
- **Examples**: Kavango-Zambezi, Waterton-Glacier

### Species-Specific Conservation

#### Endangered Species Programs
- **Species recovery plans**: Detailed conservation strategies
- **Captive breeding**: Maintain genetic diversity
- **Reintroduction**: Return species to former range
- **Success stories**: California condor, black-footed ferret

#### Flagship Species
- **Charismatic megafauna**: Generate public support
- **Umbrella species**: Protect entire ecosystems
- **Keystone species**: Disproportionate ecological impact
- **Examples**: Giant panda, tigers, elephants

### Restoration Ecology

#### Principles of Restoration
- **Reference ecosystems**: Historical or nearby examples
- **Natural processes**: Restore ecological functions
- **Native species**: Use locally adapted plants and animals
- **Adaptive management**: Learn and adjust over time

#### Restoration Techniques

##### Forest Restoration
- **Natural regeneration**: Allow forests to recover naturally
- **Assisted regeneration**: Remove barriers to recovery
- **Active restoration**: Plant trees and manage growth
- **Agroforestry**: Integrate trees with agriculture

##### Wetland Restoration
- **Hydrology**: Restore natural water flows
- **Soil conditions**: Address contamination or compaction
- **Vegetation**: Plant native wetland species
- **Wildlife**: Reintroduce native fauna

##### Grassland Restoration
- **Seed collection**: Gather local native seeds
- **Site preparation**: Remove invasive species
- **Seeding**: Plant diverse native species
- **Management**: Prescribed burning, grazing

##### Marine Restoration
- **Coral restoration**: Grow and transplant corals
- **Seagrass restoration**: Replant underwater meadows
- **Oyster reef restoration**: Rebuild filter-feeding communities
- **Mangrove restoration**: Replant coastal forests

## Community-Based Conservation

### Indigenous Conservation
- **Traditional knowledge**: Thousands of years of experience
- **Land rights**: Secure tenure for effective conservation
- **Cultural values**: Spiritual connection to nature
- **Success rates**: Indigenous lands have lower deforestation

### Local Community Involvement
- **Participatory planning**: Include local voices
- **Benefit sharing**: Ensure communities benefit from conservation
- **Capacity building**: Train local conservation leaders
- **Alternative livelihoods**: Reduce pressure on resources

### Ecotourism
- **Economic incentives**: Generate income from conservation
- **Education**: Raise awareness among visitors
- **Challenges**: Manage impacts, ensure benefits reach communities
- **Examples**: Costa Rica, Kenya, Galápagos

## Technology and Innovation

### Monitoring Technologies
- **Remote sensing**: Satellite and drone monitoring
- **Camera traps**: Monitor wildlife populations
- **Acoustic monitoring**: Track species by sound
- **Environmental DNA**: Detect species from water/soil samples
- **GPS tracking**: Follow animal movements

### Genetic Technologies
- **Genetic rescue**: Increase genetic diversity
- **Assisted gene flow**: Help species adapt to climate change
- **Biobanking**: Preserve genetic material
- **Genomics**: Understand species relationships and needs

### Artificial Intelligence
- **Species identification**: Automated image recognition
- **Predictive modeling**: Forecast ecosystem changes
- **Optimization**: Improve conservation planning
- **Data analysis**: Process large datasets

## Policy and Governance

### International Frameworks

#### Convention on Biological Diversity (CBD)
- **Aichi Targets**: 20 targets for 2020 (mostly missed)
- **Post-2020 Framework**: New targets for 2030
- **National strategies**: Country-level implementation

#### CITES
- **Trade regulation**: Control international wildlife trade
- **Appendices**: Different levels of protection
- **Enforcement**: Combat illegal trade

#### Ramsar Convention
- **Wetland protection**: International wetland conservation
- **Wise use**: Sustainable wetland management
- **Designation**: Wetlands of International Importance

### National Policies
- **Environmental laws**: Legal framework for protection
- **Land use planning**: Integrate conservation into development
- **Economic incentives**: Payments for ecosystem services
- **Enforcement**: Ensure compliance with regulations

### Local Governance
- **Zoning**: Designate areas for different uses
- **Permits**: Control activities in sensitive areas
- **Monitoring**: Track ecosystem health
- **Adaptive management**: Adjust based on results

## Financing Conservation

### Traditional Funding
- **Government budgets**: Public funding for conservation
- **International aid**: Development assistance
- **NGO fundraising**: Private donations
- **Foundation grants**: Philanthropic support

### Innovative Financing
- **Payment for ecosystem services**: Pay for conservation benefits
- **Conservation bonds**: Finance conservation projects
- **Debt-for-nature swaps**: Reduce debt for conservation
- **Carbon markets**: Pay for forest conservation
- **Biodiversity credits**: Market-based conservation incentives

### Private Sector Engagement
- **Corporate sustainability**: Business conservation commitments
- **Supply chain standards**: Sustainable sourcing
- **Impact investing**: Investments with conservation returns
- **Partnerships**: Collaborate with conservation organizations

## Measuring Success

### Indicators
- **Species populations**: Abundance and distribution
- **Habitat quality**: Ecosystem integrity measures
- **Ecosystem services**: Quantify benefits to humans
- **Threat reduction**: Monitor pressure indicators
- **Governance**: Assess management effectiveness

### Monitoring Programs
- **Long-term datasets**: Track changes over time
- **Standardized methods**: Enable comparisons
- **Adaptive management**: Use results to improve
- **Reporting**: Communicate results to stakeholders

## Case Studies

### Yellowstone Wolf Reintroduction
- **Background**: Wolves eliminated by 1926
- **Reintroduction**: 31 wolves released 1995-1996
- **Results**: Trophic cascade, ecosystem restoration
- **Lessons**: Keystone species can transform ecosystems

### Costa Rica Forest Recovery
- **Background**: 75% deforestation by 1985
- **Strategies**: Payments for ecosystem services, ecotourism
- **Results**: Forest cover increased to 54%
- **Lessons**: Economic incentives can drive conservation

### Great Barrier Reef Marine Park
- **Background**: World's largest coral reef system
- **Threats**: Climate change, pollution, coastal development
- **Management**: Zoning, water quality improvement
- **Challenges**: Climate change impacts continue

### Namibian Communal Conservancies
- **Background**: Community-based natural resource management
- **Approach**: Local communities manage wildlife
- **Results**: Wildlife recovery, economic benefits
- **Lessons**: Local ownership drives conservation success

## Future Directions

### Emerging Approaches
- **Nature-based solutions**: Use nature to address challenges
- **Rewilding**: Restore natural processes and species
- **Urban ecology**: Integrate nature into cities
- **Climate adaptation**: Help ecosystems adapt to change

### Global Initiatives
- **UN Decade on Ecosystem Restoration**: 2021-2030
- **30x30 Target**: Protect 30% by 2030
- **Nature-positive**: Reverse biodiversity loss
- **One Health**: Integrate human, animal, environmental health

### Research Priorities
- **Ecosystem functioning**: Understand ecological processes
- **Climate interactions**: Ecosystem responses to climate change
- **Social dimensions**: Human-nature relationships
- **Technology applications**: Innovative conservation tools

## Conclusion

Ecosystem conservation requires a comprehensive approach that addresses multiple threats, engages diverse stakeholders, and operates at multiple scales. Success depends on:

- **Scientific understanding**: Base decisions on solid science
- **Stakeholder engagement**: Include all affected parties
- **Adaptive management**: Learn and adjust over time
- **Adequate resources**: Ensure sufficient funding and capacity
- **Political will**: Maintain long-term commitment
- **Global cooperation**: Address transboundary challenges

The future of Earth's ecosystems depends on our ability to implement effective conservation strategies while meeting human needs. This requires transforming our relationship with nature from exploitation to stewardship.''',
                'estimated_duration': 50,
                'points_reward': 100
            }
        ]
        
        # Create lessons with quizzes
        for lesson_data in lessons_data:
            category = categories[lesson_data['category']]
            
            lesson, created = Lesson.objects.get_or_create(
                title=lesson_data['title'],
                defaults={
                    'slug': slugify(lesson_data['title']),
                    'description': lesson_data['description'],
                    'content': lesson_data['content'],
                    'category': category,
                    'author': admin_user,
                    'difficulty_level': lesson_data['difficulty'],
                    'content_type': lesson_data['content_type'],
                    'estimated_duration': lesson_data['estimated_duration'],
                    'points_reward': lesson_data['points_reward'],
                    'video_url': lesson_data.get('video_url', ''),
                    'is_published': True,
                    'is_featured': True,
                    'order': 1
                }
            )
            
            if created:
                self.stdout.write(f'Created lesson: {lesson_data["title"]}')
                
                # Create quiz for each lesson
                quiz, quiz_created = Quiz.objects.get_or_create(
                    lesson=lesson,
                    defaults={
                        'title': f'{lesson.title} - Knowledge Check',
                        'slug': slugify(f'{lesson.title} - Knowledge Check'),
                        'description': f'Test your understanding of {lesson.title.lower()}',
                        'category': category,
                        'author': admin_user,
                        'passing_score': 80,
                        'max_attempts': 3,
                        'points_reward': 25,
                        'is_published': True
                    }
                )
                
                if quiz_created:
                    # Create sample questions based on lesson content
                    self.create_quiz_questions(quiz, lesson_data['category'])
        
        # Create environmental challenges
        self.create_challenges(categories, admin_user)
        
        self.stdout.write(self.style.SUCCESS('Successfully loaded environmental education content!'))
    
    def create_quiz_questions(self, quiz, category):
        """Create quiz questions based on category"""
        
        questions_by_category = {
            'Climate Change': [
                {
                    'question': 'What percentage of global greenhouse gas emissions does carbon dioxide (CO₂) represent?',
                    'answers': [
                        {'text': '76%', 'correct': True},
                        {'text': '50%', 'correct': False},
                        {'text': '90%', 'correct': False},
                        {'text': '25%', 'correct': False}
                    ]
                },
                {
                    'question': 'Which of the following is a positive climate feedback loop?',
                    'answers': [
                        {'text': 'Ice-albedo feedback', 'correct': True},
                        {'text': 'Cloud formation', 'correct': False},
                        {'text': 'Carbon fertilization', 'correct': False},
                        {'text': 'Ocean absorption', 'correct': False}
                    ]
                },
                {
                    'question': 'How much has global average temperature risen since pre-industrial times?',
                    'answers': [
                        {'text': '1.1°C', 'correct': True},
                        {'text': '2.5°C', 'correct': False},
                        {'text': '0.5°C', 'correct': False},
                        {'text': '3.0°C', 'correct': False}
                    ]
                }
            ],
            'Renewable Energy': [
                {
                    'question': 'Which type of solar PV cell has the highest efficiency?',
                    'answers': [
                        {'text': 'Monocrystalline', 'correct': True},
                        {'text': 'Polycrystalline', 'correct': False},
                        {'text': 'Amorphous', 'correct': False},
                        {'text': 'Organic', 'correct': False}
                    ]
                },
                {
                    'question': 'What is the typical payback period for residential solar systems?',
                    'answers': [
                        {'text': '6-10 years', 'correct': True},
                        {'text': '15-20 years', 'correct': False},
                        {'text': '2-3 years', 'correct': False},
                        {'text': '25-30 years', 'correct': False}
                    ]
                },
                {
                    'question': 'How much have solar PV costs dropped since 2010?',
                    'answers': [
                        {'text': '90%', 'correct': True},
                        {'text': '50%', 'correct': False},
                        {'text': '25%', 'correct': False},
                        {'text': '75%', 'correct': False}
                    ]
                }
            ],
            'Sustainability': [
                {
                    'question': 'What is the first principle of the circular economy?',
                    'answers': [
                        {'text': 'Design out waste and pollution', 'correct': True},
                        {'text': 'Keep products in use', 'correct': False},
                        {'text': 'Regenerate natural systems', 'correct': False},
                        {'text': 'Reduce consumption', 'correct': False}
                    ]
                },
                {
                    'question': 'Which R comes first in the R-hierarchy?',
                    'answers': [
                        {'text': 'Refuse', 'correct': True},
                        {'text': 'Reduce', 'correct': False},
                        {'text': 'Reuse', 'correct': False},
                        {'text': 'Recycle', 'correct': False}
                    ]
                },
                {
                    'question': 'What does PaaS stand for in circular economy business models?',
                    'answers': [
                        {'text': 'Product-as-a-Service', 'correct': True},
                        {'text': 'Platform-as-a-Service', 'correct': False},
                        {'text': 'Payment-as-a-Service', 'correct': False},
                        {'text': 'Process-as-a-Service', 'correct': False}
                    ]
                }
            ],
            'Biodiversity': [
                {
                    'question': 'What percentage of terrestrial areas should be protected according to the 30x30 initiative?',
                    'answers': [
                        {'text': '30%', 'correct': True},
                        {'text': '17%', 'correct': False},
                        {'text': '50%', 'correct': False},
                        {'text': '10%', 'correct': False}
                    ]
                },
                {
                    'question': 'Which ecosystem service involves carbon sequestration?',
                    'answers': [
                        {'text': 'Climate regulation', 'correct': True},
                        {'text': 'Water purification', 'correct': False},
                        {'text': 'Pollination', 'correct': False},
                        {'text': 'Recreation', 'correct': False}
                    ]
                },
                {
                    'question': 'What is the main cause of habitat loss globally?',
                    'answers': [
                        {'text': 'Agriculture conversion', 'correct': True},
                        {'text': 'Climate change', 'correct': False},
                        {'text': 'Pollution', 'correct': False},
                        {'text': 'Invasive species', 'correct': False}
                    ]
                }
            ]
        }
        
        if category in questions_by_category:
            for i, q_data in enumerate(questions_by_category[category]):
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=q_data['question'],
                    question_type='multiple_choice',
                    points=10,
                    order=i + 1
                )
                
                for j, answer_data in enumerate(q_data['answers']):
                    Answer.objects.create(
                        question=question,
                        answer_text=answer_data['text'],
                        is_correct=answer_data['correct'],
                        order=j + 1
                    )
    
    def create_challenges(self, categories, admin_user):
        """Create environmental challenges"""
        
        challenges_data = [
            {
                'title': 'Carbon Footprint Reduction Challenge',
                'category': 'Climate Change',
                'difficulty': 'beginner',
                'challenge_type': 'climate_action',
                'description': 'Reduce your personal carbon footprint by 20% over 30 days',
                'problem_statement': '''Calculate and reduce your personal carbon footprint by implementing sustainable lifestyle changes. This challenge helps you understand the environmental impact of daily activities and develop practical skills for climate action.

You will learn to:
- Measure carbon emissions from various activities
- Identify high-impact reduction strategies
- Track progress over time
- Reflect on behavioral changes''',
                'input_format': 'Baseline carbon footprint calculation and daily activity logs',
                'output_format': 'Final carbon footprint calculation, activity log, and reflection report',
                'constraints': 'Must achieve at least 20% reduction over 30 days',
                'examples': [
                    {
                        'input': 'Baseline: 15 tons CO2/year',
                        'output': 'Final: 12 tons CO2/year (20% reduction achieved)'
                    }
                ],
                'hints': [
                    'Focus on transportation and energy use for biggest impact',
                    'Use online carbon calculators for accurate measurements',
                    'Document changes with photos for verification'
                ],
                'points_reward': 150,
                'xp_reward': 75
            },
            {
                'title': 'Renewable Energy System Design',
                'category': 'Renewable Energy',
                'difficulty': 'advanced',
                'challenge_type': 'energy_conservation',
                'description': 'Design a complete renewable energy system for a community building',
                'problem_statement': '''Design a comprehensive renewable energy system for a community center serving 200 people daily. Your solution must be technically feasible, economically viable, and environmentally sustainable.

Consider:
- Energy demand analysis
- Technology selection
- System sizing and configuration
- Economic feasibility
- Environmental impact''',
                'input_format': 'Building specifications, location data, energy requirements',
                'output_format': 'Complete system design with technical specifications, economic analysis, and environmental assessment',
                'constraints': 'Must meet 80% of energy needs from renewable sources, payback period under 15 years',
                'examples': [
                    {
                        'input': '2,000 m² community center, 200 daily users, 8 AM-10 PM operation',
                        'output': 'Solar PV system: 150kW capacity, battery storage: 300kWh, estimated cost: $200,000'
                    }
                ],
                'hints': [
                    'Start with energy audit to understand demand patterns',
                    'Consider hybrid systems combining multiple renewable sources',
                    'Include energy storage for grid independence'
                ],
                'points_reward': 300,
                'xp_reward': 150
            },
            {
                'title': 'Circular Economy Business Plan',
                'category': 'Sustainability',
                'difficulty': 'intermediate',
                'challenge_type': 'recycling',
                'description': 'Develop a business plan for a circular economy startup',
                'problem_statement': '''Create a comprehensive business plan for a startup that implements circular economy principles. Your plan should address a real waste stream or inefficiency and propose a viable circular solution.

Your business plan must:
- Identify a specific environmental problem
- Propose a circular economy solution
- Demonstrate market viability
- Show financial sustainability
- Include implementation strategy''',
                'input_format': 'Market research, waste stream analysis, circular economy principles',
                'output_format': 'Complete business plan with executive summary, market analysis, financial projections, and implementation timeline',
                'constraints': 'Must apply at least 3 circular economy principles, show positive ROI within 3 years',
                'examples': [
                    {
                        'input': 'Textile waste stream: 92 million tons annually',
                        'output': 'Clothing rental platform reducing textile waste by 60% in target market'
                    }
                ],
                'hints': [
                    'Focus on high-volume waste streams for maximum impact',
                    'Consider partnerships with existing businesses',
                    'Research successful circular economy case studies'
                ],
                'points_reward': 250,
                'xp_reward': 125
            }
        ]
        
        for challenge_data in challenges_data:
            category = categories[challenge_data['category']]
            
            challenge, created = Challenge.objects.get_or_create(
                title=challenge_data['title'],
                defaults={
                    'slug': slugify(challenge_data['title']),
                    'description': challenge_data['description'],
                    'problem_statement': challenge_data['problem_statement'],
                    'input_format': challenge_data['input_format'],
                    'output_format': challenge_data['output_format'],
                    'constraints': challenge_data['constraints'],
                    'examples': challenge_data['examples'],
                    'hints': challenge_data['hints'],
                    'category': category,
                    'author': admin_user,
                    'difficulty_level': challenge_data['difficulty'],
                    'challenge_type': challenge_data['challenge_type'],
                    'points_reward': challenge_data['points_reward'],
                    'xp_reward': challenge_data['xp_reward'],
                    'status': 'published',
                    'is_featured': True
                }
            )
            
            if created:
                self.stdout.write(f'Created challenge: {challenge_data["title"]}')