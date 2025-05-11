/**
 * Trust Overview Component
 * 
 * This component displays the overall trust architecture, available validation tiers,
 * verification methods, and platform trust statistics.
 */

import { Card } from "@/components/ui/core";
import { ValidationTierBadge } from "./ui/validation-tier-badge";
import { cn } from "@/lib/utils";

interface TrustTier {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface VerificationMethod {
  id: string;
  name: string;
  description: string;
}

interface TrustStats {
  verifiedBuilders: number;
  expertBuilders: number;
  totalVerifications: number;
}

interface TrustOverviewData {
  tiers: TrustTier[];
  verificationMethods: VerificationMethod[];
  stats: TrustStats;
}

interface TrustOverviewProps {
  data: TrustOverviewData;
}

export function TrustOverview({ data }: TrustOverviewProps) {
  const { tiers, verificationMethods, stats } = data;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Trust Architecture</h2>
        <p className="text-muted-foreground mb-6">
          Our trust architecture provides transparency and verification for all builders on the platform,
          ensuring high-quality services and genuine expertise.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">{stats.verifiedBuilders + stats.expertBuilders}</div>
            <div className="text-sm text-muted-foreground">Verified Builders</div>
          </Card>
          <Card className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">{stats.expertBuilders}</div>
            <div className="text-sm text-muted-foreground">Expert Builders</div>
          </Card>
          <Card className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">{stats.totalVerifications}</div>
            <div className="text-sm text-muted-foreground">Total Verifications</div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Validation Tiers</h2>
        <p className="text-muted-foreground mb-6">
          Builders can progress through validation tiers by completing verification steps,
          unlocking additional benefits and opportunities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ValidationTierBadge tier={tier.id as any} size="lg" />
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{tier.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {tier.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div 
                className={cn(
                  "py-3 px-6 text-center text-white font-medium",
                  tier.id === "basic" ? "bg-gray-500" : 
                  tier.id === "verified" ? "bg-blue-500" : 
                  "bg-yellow-500"
                )}
              >
                {tier.id === "basic" ? "Getting Started" : 
                 tier.id === "verified" ? "Most Popular" : 
                 "Highest Trust Level"}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Verification Methods</h2>
        <p className="text-muted-foreground mb-6">
          Multiple verification methods ensure comprehensive evaluation of builders' identities and skills.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verificationMethods.map((method) => (
            <Card key={method.id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{method.name}</h3>
              <p className="text-muted-foreground">{method.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}