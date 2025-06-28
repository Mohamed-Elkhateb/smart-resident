# Smart Home API - AWS Infrastructure with VPC & Availability Zones

```
                                    INTERNET
                                       │
                                   ┌───▼───┐
                                   │  IGW  │ Internet Gateway
                                   └───┬───┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                              AWS REGION (us-east-1)                         │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                            VPC (10.0.0.0/16)                       │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────┐    ┌─────────────────────────┐        │   │
│  │  │    AVAILABILITY ZONE A  │    │    AVAILABILITY ZONE B  │        │   │
│  │  │      (us-east-1a)       │    │      (us-east-1b)       │        │   │
│  │  │                         │    │                         │        │   │
│  │  │  ┌─────────────────┐    │    │  ┌─────────────────┐    │        │   │
│  │  │  │ Public Subnet   │    │    │  │ Public Subnet   │    │        │   │
│  │  │  │ 10.0.1.0/24     │    │    │  │ 10.0.2.0/24     │    │        │   │
│  │  │  │                 │    │    │  │                 │    │        │   │
│  │  │  │ ┌─────────────┐ │    │    │  │ ┌─────────────┐ │    │        │   │
│  │  │  │ │API Gateway  │ │    │    │  │ │API Gateway  │ │    │        │   │
│  │  │  │ │Edge Location│ │    │    │  │ │Edge Location│ │    │        │   │
│  │  │  │ │- REST API   │ │    │    │  │ │- Failover   │ │    │        │   │
│  │  │  │ │- CORS       │ │    │    │  │ │- Load Bal   │ │    │        │   │
│  │  │  │ └─────────────┘ │    │    │  │ └─────────────┘ │    │        │   │
│  │  │  └─────────────────┘    │    │  └─────────────────┘    │        │   │
│  │  │                         │    │                         │        │   │
│  │  │  ┌─────────────────┐    │    │  ┌─────────────────┐    │        │   │
│  │  │  │ Private Subnet  │    │    │  │ Private Subnet  │    │        │   │
│  │  │  │ 10.0.3.0/24     │    │    │  │ 10.0.4.0/24     │    │        │   │
│  │  │  │                 │    │    │  │                 │    │        │   │
│  │  │  │ ┌─────────────┐ │    │    │  │ ┌─────────────┐ │    │        │   │
│  │  │  │ │   Lambda    │ │    │    │  │ │   Lambda    │ │    │        │   │
│  │  │  │ │ Functions   │ │    │    │  │ │ Functions   │ │    │        │   │
│  │  │  │ │- Create     │ │    │    │  │ │- Get All    │ │    │        │   │
│  │  │  │ │- Get Device │ │    │    │  │ │- Update     │ │    │        │   │
│  │  │  │ │- Delete     │ │    │    │  │ │- Replicas   │ │    │        │   │
│  │  │  │ └─────────────┘ │    │    │  │ └─────────────┘ │    │        │   │
│  │  │  └─────────────────┘    │    │  └─────────────────┘    │        │   │
│  │  │                         │    │                         │        │   │
│  │  │  ┌─────────────────┐    │    │  ┌─────────────────┐    │        │   │
│  │  │  │ Database Subnet │    │    │  │ Database Subnet │    │        │   │
│  │  │  │ 10.0.5.0/24     │    │    │  │ 10.0.6.0/24     │    │        │   │
│  │  │  │                 │    │    │  │                 │    │        │   │
│  │  │  │ ┌─────────────┐ │    │    │  │ ┌─────────────┐ │    │        │   │
│  │  │  │ │ DynamoDB    │ │    │    │  │ │ DynamoDB    │ │    │        │   │
│  │  │  │ │ Primary     │◄┼────┼────┼──┼►│ Replica     │ │    │        │   │
│  │  │  │ │- Devices    │ │    │    │  │ │- Auto Sync  │ │    │        │   │
│  │  │  │ │- Encryption │ │    │    │  │ │- Failover   │ │    │        │   │
│  │  │  │ └─────────────┘ │    │    │  │ └─────────────┘ │    │        │   │
│  │  │  └─────────────────┘    │    │  └─────────────────┘    │        │   │
│  │  └─────────────────────────┘    └─────────────────────────┘        │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────┐                                       │   │
│  │  │    AVAILABILITY ZONE C  │                                       │   │
│  │  │      (us-east-1c)       │                                       │   │
│  │  │                         │                                       │   │
│  │  │  ┌─────────────────┐    │                                       │   │
│  │  │  │ Backup Subnet   │    │                                       │   │
│  │  │  │ 10.0.7.0/24     │    │                                       │   │
│  │  │  │                 │    │                                       │   │
│  │  │  │ ┌─────────────┐ │    │                                       │   │
│  │  │  │ │ DynamoDB    │ │    │                                       │   │
│  │  │  │ │ Backup      │ │    │                                       │   │
│  │  │  │ │- Point Time │ │    │                                       │   │
│  │  │  │ │- Disaster   │ │    │                                       │   │
│  │  │  │ │  Recovery   │ │    │                                       │   │
│  │  │  │ └─────────────┘ │    │                                       │   │
│  │  │  └─────────────────┘    │                                       │   │
│  │  └─────────────────────────┘                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                        MANAGED SERVICES                             │   │
│  │                      (Multi-AZ by Default)                         │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │ Amazon Cognito  │  │   CloudWatch    │  │      Route 53   │    │   │
│  │  │ - User Pool     │  │ - Logs & Metrics│  │ - DNS Failover  │    │   │
│  │  │ - Multi-Region  │  │ - Alarms        │  │ - Health Checks │    │   │
│  │  │ - Auto Scale    │  │ - Dashboards    │  │                 │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## **Network & Infrastructure Details:**

### 🌐 **VPC Configuration:**
- **CIDR:** 10.0.0.0/16 (65,536 IP addresses)
- **Internet Gateway** for public access
- **Route Tables** for traffic routing
- **Security Groups** as virtual firewalls

### 🏢 **Availability Zones:**
- **AZ-A (us-east-1a):** Primary compute and data
- **AZ-B (us-east-1b):** Replica and failover
- **AZ-C (us-east-1c):** Backup and disaster recovery

### 📡 **Subnets:**
- **Public Subnets:** API Gateway endpoints
- **Private Subnets:** Lambda functions (secure)
- **Database Subnets:** DynamoDB isolated

### 🔄 **High Availability:**
- Cross-AZ replication for all data
- Automatic failover in <30 seconds
- Load balancing across zones
- 99.99% availability SLA

### 🛡️ **Security:**
- Private subnets for compute layer
- VPC endpoints for AWS services
- Security groups restrict access
- No direct internet access to Lambda

---

## **Important Note About Serverless Architecture:**

**Your current SAM template deploys a SERVERLESS architecture** which means:
- **No VPC required** - AWS manages the infrastructure
- **API Gateway** is a managed service (no VPC)
- **Lambda** runs in AWS-managed VPC by default
- **DynamoDB** is a managed service (no VPC)
- **Cognito** is a global managed service

**To implement the VPC architecture above, you would need to:**
1. Create VPC resources in your SAM template
2. Configure Lambda functions with VPC settings
3. Set up VPC endpoints for DynamoDB access
4. Add NAT Gateways for Lambda internet access

**Current deployment = Simpler, cheaper, still highly available**
**VPC deployment = More control, enterprise compliance, higher cost**