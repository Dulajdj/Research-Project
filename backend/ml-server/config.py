# config.py

SKILL_ALIASES = {
    # Existing stacks
    "mern": ["mongodb", "express", "react", "node", "javascript", "rest api", "jwt"],
    "mern stack": ["mongodb", "express", "react", "node", "javascript", "rest api", "jwt"],
    "mean": ["mongodb", "express", "angular", "node", "typescript", "rest api"],
    "lamp": ["linux", "apache", "mysql", "php", "html", "css", "javascript"],
    "lemp": ["linux", "nginx", "mysql", "php", "rest api"],
    "jamstack": ["javascript", "apis", "markup", "static site generation", "cdn"],
    "flutter": ["flutter", "dart", "firebase", "rest api", "mobile ui"],
    "react native": ["react native", "javascript", "redux", "mobile development", "rest api"],
    "django": ["python", "django", "postgresql", "rest api", "html", "css"],
    "spring boot": ["java", "spring boot", "hibernate", "rest api", "mysql"],
    "devops": ["docker", "kubernetes", "jenkins", "git", "ci/cd", "linux", "terraform"],
    "data science": ["python", "pandas", "numpy", "scikit-learn", "matplotlib", "seaborn", "machine learning"],
    "ai/ml": ["python", "tensorflow", "pytorch", "keras", "scikit-learn", "deep learning", "nlp"],
    "big data": ["hadoop", "spark", "kafka", "hdfs", "hive", "pig"],
    "aws cloud": ["aws ec2", "s3", "lambda", "rds", "cloudformation", "iam"],
    "gcp cloud": ["compute engine", "app engine", "bigquery", "cloud functions", "iam"],
    "azure cloud": ["azure vms", "azure functions", "azure sql", "devops", "active directory"],
    "cybersecurity": ["network security", "penetration testing", "encryption", "firewalls", "siem"],
    "ios dev": ["swift", "objective-c", "xcode", "cocoa touch", "core data"],
    "android dev": ["kotlin", "java", "android studio", "jetpack compose", "room db"],
    "ui/ux": ["figma", "sketch", "adobe xd", "prototyping", "wireframing", "user research"],
    "blockchain": ["solidity", "ethereum", "smart contracts", "web3.js", "truffle", "hardhat"],
    "iot": ["arduino", "raspberry pi", "mqtt", "sensors", "embedded c"],
    "salesforce": ["apex", "lightning", "visualforce", "soql", "salesforce admin"],
    "sap": ["sap hana", "abap", "fiori", "sap modules", "sap bi"],
    "wordpress": ["php", "mysql", "html", "css", "javascript", "plugins development"],
    "magento": ["php", "mysql", "html", "css", "magento modules", "e-commerce"],
    "shopify": ["liquid", "html", "css", "javascript", "shopify apis"],
    
    # React/JS frameworks aliases
    "react.js": ["react"],
    "reactjs": ["react"],
    "react": ["react"],
    "angularjs": ["angular"],
    "angular": ["angular"],
    "vuejs": ["vue.js", "vue"],
    "vue": ["vue.js", "vue"],
    "nextjs": ["next.js", "react"],
    "nuxtjs": ["nuxt.js", "vue.js"],
    "svelte": ["svelte"],
    
    # Backend / API aliases
    "node.js": ["node"],
    "node": ["node"],
    "express.js": ["express"],
    "express": ["express"],
    
    # Database aliases
    "mongodb": ["mongodb", "mongoose"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql"],
    "firebase": ["firebase", "firestore", "realtime db"],
    
    # Cloud aliases
    "aws": ["aws ec2", "s3", "lambda", "rds", "cloudformation", "iam"],
    "gcp": ["compute engine", "app engine", "bigquery", "cloud functions", "iam"],
    "azure": ["azure vms", "azure functions", "azure sql"],
    
    # DevOps & CI/CD
    "ci/cd": ["jenkins", "github actions", "gitlab ci", "docker", "kubernetes"],
    "terraform": ["terraform"],
    "ansible": ["ansible", "playbooks", "inventory", "roles", "yaml"],
    
    # Analytics & BI
    "power bi": ["power bi", "dax", "power query"],
    "tableau": ["tableau desktop", "tableau prep", "viz", "dashboards", "calculations"],
    
    # Messaging / Streaming
    "kafka": ["apache kafka", "zookeeper", "producer", "consumer", "stream processing"],
    "rabbitmq": ["rabbitmq", "queues", "exchanges", "producers", "consumers"],
    "redis": ["redis", "caching", "pub/sub", "data structures", "persistence"],
    
    # Others
    "graphql": ["apollo", "relay", "graphql queries", "resolvers", "schemas"],
    "rest api": ["http", "json", "endpoints", "express", "node", "authentication"],
    "elasticsearch": ["elasticsearch", "kibana", "logstash", "beats", "query dsl"],
    "hadoop": ["hadoop", "hdfs", "mapreduce", "yarn", "hive", "pig"],
    "spark": ["apache spark", "rdd", "dataframes", "pyspark", "mllib"]
}