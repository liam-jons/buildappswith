 buildappswith git:(feature/auth-cleanup1) ✗ pnpm type-check

> buildappswith@1.0.142 type-check /Users/liamj/Documents/development/buildappswith
> tsc --noEmit

app/(marketing)/metadata.ts:99:3 - error TS2561: Object literal may only specify known properties, but 'themeColour' does not exist in type 'Metadata'. Did you mean to write 'themeColor'?

99   themeColour: [
     ~~~~~~~~~~~

app/(platform)/book/[builderId]/page.tsx:110:60 - error TS2339: Property 'avatarUrl' does not exist on type '{ sessionTypes: { price: number; builderId: string; id: string; createdAt: Date; updatedAt: Date; title: string; description: string; color: string | null; durationMinutes: number; ... 9 more ...; calendlyEventTypeUri: string | null; }[]; ... 28 more ...; schedulingSettings: JsonValue; }'.

110           {(builderProfile.user.imageUrl || builderProfile.avatarUrl) && (
                                                               ~~~~~~~~~

app/(platform)/book/[builderId]/page.tsx:113:69 - error TS2339: Property 'avatarUrl' does not exist on type '{ sessionTypes: { price: number; builderId: string; id: string; createdAt: Date; updatedAt: Date; title: string; description: string; color: string | null; durationMinutes: number; ... 9 more ...; calendlyEventTypeUri: string | null; }[]; ... 28 more ...; schedulingSettings: JsonValue; }'.

113                 src={builderProfile.user.imageUrl || builderProfile.avatarUrl || ''}
                                                                        ~~~~~~~~~

app/(platform)/book/[builderId]/page.tsx:139:13 - error TS2322: Type '{ price: number; builderId: string; id: string; createdAt: Date; updatedAt: Date; title: string; description: string; color: string | null; durationMinutes: number; currency: string; ... 8 more ...; calendlyEventTypeUri: string | null; }[]' is not assignable to type 'SessionType[]'.
  Type '{ price: number; builderId: string; id: string; createdAt: Date; updatedAt: Date; title: string; description: string; color: string | null; durationMinutes: number; currency: string; isActive: boolean; ... 7 more ...; calendlyEventTypeUri: string | null; }' is not assignable to type 'SessionType'.
    Types of property 'color' are incompatible.
      Type 'string | null' is not assignable to type 'string | undefined'.
        Type 'null' is not assignable to type 'string | undefined'.

139             sessionTypes={builderProfile.sessionTypes}
                ~~~~~~~~~~~~

  components/scheduling/client/booking-flow.tsx:19:3
    19   sessionTypes?: SessionType[];
         ~~~~~~~~~~~~
    The expected type comes from property 'sessionTypes' which is declared here on type 'IntrinsicAttributes & BookingFlowProps'

app/(platform)/builder/[slug]/page.tsx:21:24 - error TS2339: Property 'success' does not exist on type 'BuilderProfileResponse'.

21   if (!profileResponse.success || !profileResponse.data) {
                          ~~~~~~~

app/(platform)/builder/[slug]/page.tsx:21:52 - error TS2339: Property 'data' does not exist on type 'BuilderProfileResponse'.

21   if (!profileResponse.success || !profileResponse.data) {
                                                      ~~~~

app/(platform)/builder/[slug]/page.tsx:28:35 - error TS2339: Property 'data' does not exist on type 'BuilderProfileResponse'.

28   const profile = profileResponse.data;
                                     ~~~~

app/(platform)/builder/[slug]/page.tsx:39:7 - error TS2353: Object literal may only specify known properties, and 'profile' does not exist in type 'OpenGraphProfile'.

39       profile: {
         ~~~~~~~

  node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.9.0_@playwright+test@1.52.0_babel-_30ad5b3ccc483713870fb6b83d70ac97/node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:274:5
    274     openGraph?: null | OpenGraph | undefined;
            ~~~~~~~~~
    The expected type comes from property 'openGraph' which is declared here on type 'Metadata'

app/(platform)/builder/[slug]/page.tsx:281:13 - error TS2322: Type '{ id: string; name: string; title: string; bio: string; avatarUrl: string; coverImageUrl: string; validationTier: ValidationTier; joinDate: Date; completedProjects: number; ... 9 more ...; expertiseAreas: { ...; }; }' is not assignable to type 'BuilderProfileData'.
  Types of property 'validationTier' are incompatible.
    Type 'import("/Users/liamj/Documents/development/buildappswith/lib/profile/types").ValidationTier' is not assignable to type 'import("/Users/liamj/Documents/development/buildappswith/lib/trust/types").ValidationTier'.

281             profile={profile}
                ~~~~~~~

  components/profile/builder-profile-client-wrapper.tsx:23:3
    23   profile: BuilderProfileData;
         ~~~~~~~
    The expected type comes from property 'profile' which is declared here on type 'IntrinsicAttributes & BuilderProfileClientWrapperProps'

app/(platform)/builder/profile/components/metrics-display.tsx:3:32 - error TS2307: Cannot find module '@/lib/types/builder' or its corresponding type declarations.

3 import { BuilderMetrics } from '@/lib/types/builder';
                                 ~~~~~~~~~~~~~~~~~~~~~

app/(platform)/builder/profile/components/metrics-display.tsx:12:8 - error TS2613: Module '"/Users/liamj/Documents/development/buildappswith/components/magicui/particles"' has no default export. Did you mean to use 'import { Particles } from "/Users/liamj/Documents/development/buildappswith/components/magicui/particles"' instead?

12 import Particles from '@/components/magicui/particles';
          ~~~~~~~~~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:7:25 - error TS2307: Cannot find module '@/lib/types/builder' or its corresponding type declarations.

7 import { Project } from '@/lib/types/builder';
                          ~~~~~~~~~~~~~~~~~~~~~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:26:29 - error TS2307: Cannot find module '@/components/magicui/text-shimmer' or its corresponding type declarations.

26 import { TextShimmer } from '@/components/magicui/text-shimmer';
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:39:36 - error TS7006: Parameter 'tech' implicitly has an 'any' type.

39       project.technologies.forEach(tech => {
                                      ~~~~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:94:30 - error TS7006: Parameter 'a' implicitly has an 'any' type.

94     ? project.outcomes.sort((a, b) => {
                                ~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:94:33 - error TS7006: Parameter 'b' implicitly has an 'any' type.

94     ? project.outcomes.sort((a, b) => {
                                   ~

app/(platform)/builder/profile/components/portfolio-gallery.tsx:161:112 - error TS7006: Parameter 'tech' implicitly has an 'any' type.

161           {project.technologies && Array.isArray(project.technologies) && project.technologies.slice(0, 3).map(tech => (
                                                                                                                   ~~~~

app/(platform)/builder/profile/components/validation-tier.tsx:3:44 - error TS2307: Cannot find module '@/lib/types/builder' or its corresponding type declarations.

3 import { ValidationTier as TierType } from '@/lib/types/builder';
                                             ~~~~~~~~~~~~~~~~~~~~~

app/(platform)/builder/profile/components/validation-tier.tsx:12:29 - error TS2307: Cannot find module '@/components/magicui/text-shimmer' or its corresponding type declarations.

12 import { TextShimmer } from '@/components/magicui/text-shimmer';
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/(platform)/marketplace/page.tsx:5:3 - error TS2305: Module '"@/components/marketplace"' has no exported member 'BuilderListClient'.

5   BuilderListClient,
    ~~~~~~~~~~~~~~~~~

app/(platform)/profile/[id]/page.tsx:88:13 - error TS2322: Type '{ userId: string; isPublicView: boolean; }' is not assignable to type 'IntrinsicAttributes & BuilderProfileProps'.
  Property 'userId' does not exist on type 'IntrinsicAttributes & BuilderProfileProps'.

88             userId={params.id}
               ~~~~~~

app/(platform)/profile/[id]/page.tsx:94:13 - error TS2322: Type '{ userId: string; isPublicView: boolean; }' is not assignable to type 'IntrinsicAttributes & ClientProfileProps'.
  Property 'isPublicView' does not exist on type 'IntrinsicAttributes & ClientProfileProps'.

94             isPublicView={!isOwnProfile}
               ~~~~~~~~~~~~

app/(platform)/profile/page.tsx:13:10 - error TS2305: Module '"@/components/profile/ui"' has no exported member 'ProfileSkeleton'.

13 import { ProfileSkeleton } from "@/components/profile/ui";
            ~~~~~~~~~~~~~~~

app/(platform)/profile/page.tsx:49:46 - error TS2554: Expected 0 arguments, but got 1.

49   const profile = await getPublicUserProfile(userId);
                                                ~~~~~~

app/(platform)/profile/profile-settings/availability/page.tsx:22:52 - error TS2339: Property 'includes' does not exist on type '{}'.

22       const isBuilder = user.publicMetadata.roles?.includes(UserRole.BUILDER);
                                                      ~~~~~~~~

app/(platform)/profile/profile-settings/page.tsx:46:17 - error TS2339: Property 'isLoading' does not exist on type 'AuthContextType'.

46   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                   ~~~~~~~~~

app/(platform)/profile/profile-settings/page.tsx:46:28 - error TS2339: Property 'isAuthenticated' does not exist on type 'AuthContextType'.

46   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                              ~~~~~~~~~~~~~~~

app/(platform)/profile/profile-settings/page.tsx:46:45 - error TS2339: Property 'updateSession' does not exist on type 'AuthContextType'.

46   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                                               ~~~~~~~~~~~~~

app/(platform)/trust/verification/[builderId]/page.tsx:51:7 - error TS2322: Type '{ builder: any; verification: any; }' is not assignable to type 'IntrinsicAttributes & VerificationDetailProps'.
  Property 'builder' does not exist on type 'IntrinsicAttributes & VerificationDetailProps'.

51       builder={builderData}
         ~~~~~~~

app/api/admin/builders/route.ts:3:21 - error TS2305: Module '"@/lib/auth"' has no exported member 'AuthenticationError'.

3 import { withAdmin, AuthenticationError, AuthorizationError, AuthErrorType } from "@/lib/auth";
                      ~~~~~~~~~~~~~~~~~~~

app/api/admin/builders/route.ts:3:42 - error TS2305: Module '"@/lib/auth"' has no exported member 'AuthorizationError'.

3 import { withAdmin, AuthenticationError, AuthorizationError, AuthErrorType } from "@/lib/auth";
                                           ~~~~~~~~~~~~~~~~~~

app/api/admin/builders/route.ts:11:30 - error TS2345: Argument of type '(req: NextRequest, auth: AuthObject) => Promise<NextResponse<{ success: boolean; data: { id: string; userId: string; name: string | null; email: string; image: string | null; headline: string | null; ... 4 more ...; validationTier: number; }[]; count: number; }> | NextResponse<...>>' is not assignable to parameter of type 'RoleHandler<{ params?: any; }>'.
  Types of parameters 'auth' and 'context' are incompatible.
    Type '{ params?: any; }' is missing the following properties from type 'AuthObject': userId, roles, claims

11 export const GET = withAdmin(async (req: NextRequest, auth: AuthObject) => {
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/admin/builders/route.ts:81:43 - error TS18046: 'error' is of type 'unknown'.

81       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                             ~~~~~

app/api/admin/builders/route.ts:81:70 - error TS18046: 'error' is of type 'unknown'.

81       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                                                        ~~~~~

app/api/admin/session-types/[id]/route.ts:3:21 - error TS2305: Module '"@/lib/auth"' has no exported member 'AuthenticationError'.

3 import { withAdmin, AuthenticationError, AuthorizationError, ResourceNotFoundError, AuthErrorType } from "@/lib/auth";
                      ~~~~~~~~~~~~~~~~~~~

app/api/admin/session-types/[id]/route.ts:3:42 - error TS2305: Module '"@/lib/auth"' has no exported member 'AuthorizationError'.

3 import { withAdmin, AuthenticationError, AuthorizationError, ResourceNotFoundError, AuthErrorType } from "@/lib/auth";
                                           ~~~~~~~~~~~~~~~~~~

app/api/admin/session-types/[id]/route.ts:3:62 - error TS2305: Module '"@/lib/auth"' has no exported member 'ResourceNotFoundError'.

3 import { withAdmin, AuthenticationError, AuthorizationError, ResourceNotFoundError, AuthErrorType } from "@/lib/auth";
                                                               ~~~~~~~~~~~~~~~~~~~~~

app/api/admin/session-types/[id]/route.ts:85:43 - error TS18046: 'error' is of type 'unknown'.

85       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                             ~~~~~

app/api/admin/session-types/[id]/route.ts:85:70 - error TS18046: 'error' is of type 'unknown'.

85       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                                                        ~~~~~

app/api/admin/session-types/[id]/route.ts:178:43 - error TS18046: 'error' is of type 'unknown'.

178       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                              ~~~~~

app/api/admin/session-types/[id]/route.ts:178:70 - error TS18046: 'error' is of type 'unknown'.

178       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                                                         ~~~~~

app/api/admin/session-types/[id]/route.ts:248:43 - error TS18046: 'error' is of type 'unknown'.

248       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                              ~~~~~

app/api/admin/session-types/[id]/route.ts:248:70 - error TS18046: 'error' is of type 'unknown'.

248       return NextResponse.json({ message: error.message }, { status: error.statusCode });
                                                                         ~~~~~

app/api/profiles/builder/[id]/route.ts:48:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

48             image: true,
               ~~~~~

app/api/profiles/builder/[id]/route.ts:68:44 - error TS2339: Property 'skills' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

68     const formattedSkills = builderProfile.skills.map(skill => ({
                                              ~~~~~~

app/api/profiles/builder/[id]/route.ts:68:55 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

68     const formattedSkills = builderProfile.skills.map(skill => ({
                                                         ~~~~~

app/api/profiles/builder/[id]/route.ts:78:28 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

78         id: builderProfile.user.id,
                              ~~~~

app/api/profiles/builder/[id]/route.ts:79:30 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

79         name: builderProfile.user.name,
                                ~~~~

app/api/profiles/builder/[id]/route.ts:80:31 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

80         email: builderProfile.user.email,
                                 ~~~~

app/api/profiles/builder/[id]/route.ts:81:31 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

81         image: builderProfile.user.image,
                                 ~~~~

app/api/profiles/builder/[id]/route.ts:87:33 - error TS2551: Property 'adhdFocus' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'. Did you mean 'adhd_focus'?

87       adhdFocus: builderProfile.adhdFocus,
                                   ~~~~~~~~~

app/api/profiles/builder/clerk/[clerkId]/route.ts:65:29 - error TS2339: Property 'category' does not exist on type '{ status: SkillStatus; name: string; id: string; createdAt: Date; updatedAt: Date; description: string | null; domain: string; level: number; slug: string; pathways: string[]; prerequisites: string[]; isFundamental: boolean; }'.

65       category: skill.skill.category,
                               ~~~~~~~~

app/api/profiles/builder/clerk/[clerkId]/route.ts:76:21 - error TS2339: Property 'image' does not exist on type '{ builderProfile: ({ skills: ({ skill: { status: SkillStatus; name: string; id: string; createdAt: Date; updatedAt: Date; description: string | null; domain: string; ... 4 more ...; isFundamental: boolean; }; } & { ...; })[]; } & { ...; }) | null; } & { ...; }'.

76         image: user.image,
                       ~~~~~

app/api/profiles/builder/clerk/[clerkId]/route.ts:82:38 - error TS2551: Property 'adhdFocus' does not exist on type '{ skills: ({ skill: { status: SkillStatus; name: string; id: string; createdAt: Date; updatedAt: Date; description: string | null; domain: string; level: number; slug: string; pathways: string[]; prerequisites: string[]; isFundamental: boolean; }; } & { ...; })[]; } & { ...; }'. Did you mean 'adhd_focus'?

82       adhdFocus: user.builderProfile.adhdFocus,
                                        ~~~~~~~~~

app/api/profiles/builder/route.ts:214:11 - error TS2322: Type '{ name: string; }' is not assignable to type 'SkillWhereUniqueInput'.
  Type '{ name: string; }' is not assignable to type '{ id: string; slug: string; } & { id?: string | undefined; slug?: string | undefined; AND?: SkillWhereInput | SkillWhereInput[] | undefined; OR?: SkillWhereInput[] | undefined; ... 13 more ...; userProgress?: UserSkillProgressListRelationFilter | undefined; }'.
    Type '{ name: string; }' is missing the following properties from type '{ id: string; slug: string; }': id, slug

214           where: { name: skillName },
              ~~~~~

  node_modules/.prisma/client/index.d.ts:13476:5
    13476     where: SkillWhereUniqueInput
              ~~~~~
    The expected type comes from property 'where' which is declared here on type '{ select?: SkillSelect<DefaultArgs> | null | undefined; omit?: SkillOmit<DefaultArgs> | null | undefined; include?: SkillInclude<DefaultArgs> | null | undefined; where: SkillWhereUniqueInput; }'

app/api/profiles/builder/route.ts:242:13 - error TS2322: Type '{ skill: { create: { name: string; slug: string; domain?: string | undefined; }; }; }[]' is not assignable to type '(Without<BuilderSkillCreateWithoutBuilderInput, BuilderSkillUncheckedCreateWithoutBuilderInput> & BuilderSkillUncheckedCreateWithoutBuilderInput) | (Without<...> & BuilderSkillCreateWithoutBuilderInput) | BuilderSkillCreateWithoutBuilderInput[] | BuilderSkillUncheckedCreateWithoutBuilderInput[] | undefined'.
  Type '{ skill: { create: { name: string; slug: string; domain?: string | undefined; }; }; }[]' is not assignable to type 'BuilderSkillCreateWithoutBuilderInput[]'.
    Property 'proficiency' is missing in type '{ skill: { create: { name: string; slug: string; domain?: string; }; }; }' but required in type 'BuilderSkillCreateWithoutBuilderInput'.

242             create: skillsToCreate.map(skillData => ({ skill: { create: skillData } })),
                ~~~~~~

  node_modules/.prisma/client/index.d.ts:38631:5
    38631     proficiency: number
              ~~~~~~~~~~~
    'proficiency' is declared here.

app/api/profiles/builder/route.ts:260:13 - error TS2322: Type '{ skill: { create: { name: string; slug: string; domain?: string | undefined; }; }; }[]' is not assignable to type '(Without<BuilderSkillCreateWithoutBuilderInput, BuilderSkillUncheckedCreateWithoutBuilderInput> & BuilderSkillUncheckedCreateWithoutBuilderInput) | (Without<...> & BuilderSkillCreateWithoutBuilderInput) | BuilderSkillCreateWithoutBuilderInput[] | BuilderSkillUncheckedCreateWithoutBuilderInput[] | undefined'.
  Type '{ skill: { create: { name: string; slug: string; domain?: string | undefined; }; }; }[]' is not assignable to type 'BuilderSkillCreateWithoutBuilderInput[]'.
    Property 'proficiency' is missing in type '{ skill: { create: { name: string; slug: string; domain?: string; }; }; }' but required in type 'BuilderSkillCreateWithoutBuilderInput'.

260             create: skillsToCreate.map(skillData => ({ skill: { create: skillData } })),
                ~~~~~~

  node_modules/.prisma/client/index.d.ts:38631:5
    38631     proficiency: number
              ~~~~~~~~~~~
    'proficiency' is declared here.

app/api/profiles/builder/route.ts:268:53 - error TS2339: Property 'skills' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

268     const formattedSkills = updatedOrCreatedProfile.skills.map(skill => ({
                                                        ~~~~~~

app/api/profiles/builder/route.ts:268:64 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

268     const formattedSkills = updatedOrCreatedProfile.skills.map(skill => ({
                                                                   ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:40:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

40             image: true,
               ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:60:44 - error TS2339: Property 'skills' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

60     const formattedSkills = builderProfile.skills.map(skill => ({
                                              ~~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:60:55 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

60     const formattedSkills = builderProfile.skills.map(skill => ({
                                                         ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:71:28 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

71         id: builderProfile.user.id,
                              ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:72:30 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

72         name: builderProfile.user.name,
                                ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:73:31 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

73         email: builderProfile.user.email,
                                 ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:74:31 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

74         image: builderProfile.user.image,
                                 ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:80:33 - error TS2551: Property 'adhdFocus' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'. Did you mean 'adhd_focus'?

80       adhdFocus: builderProfile.adhdFocus,
                                   ~~~~~~~~~

app/api/profiles/builders/route.ts:58:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

58             image: true,
               ~~~~~

app/api/profiles/builders/route.ts:82:21 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

82         id: profile.user.id,
                       ~~~~

app/api/profiles/builders/route.ts:83:23 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

83         name: profile.user.name,
                         ~~~~

app/api/profiles/builders/route.ts:84:24 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

84         email: profile.user.email,
                          ~~~~

app/api/profiles/builders/route.ts:85:24 - error TS2339: Property 'user' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

85         image: profile.user.image,
                          ~~~~

app/api/profiles/builders/route.ts:89:23 - error TS2339: Property 'skills' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

89       skills: profile.skills.map(skill => ({
                         ~~~~~~

app/api/profiles/builders/route.ts:89:34 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

89       skills: profile.skills.map(skill => ({
                                    ~~~~~

app/api/profiles/builders/route.ts:95:26 - error TS2551: Property 'adhdFocus' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'. Did you mean 'adhd_focus'?

95       adhdFocus: profile.adhdFocus,
                            ~~~~~~~~~

app/api/scheduling/availability-exceptions/route.ts:106:30 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

106 export const POST = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-exceptions/route.ts:169:35 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

169 export const GET_BY_ID = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-exceptions/route.ts:237:29 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

237 export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-exceptions/route.ts:327:32 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

327 export const DELETE = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-rules/route.ts:99:30 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

99 export const POST = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-rules/route.ts:162:29 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

162 export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/availability-rules/route.ts:287:32 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject' is not assignable to type 'string'.

287 export const DELETE = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:5:10 - error TS2724: '"@/lib/scheduling/calendly/api-client"' has no exported member named 'calendlyApiClient'. Did you mean 'CalendlyApiClient'?

5 import { calendlyApiClient } from '@/lib/scheduling/calendly/api-client';
           ~~~~~~~~~~~~~~~~~

  lib/scheduling/calendly/api-client.ts:106:14
    106 export class CalendlyApiClient {
                     ~~~~~~~~~~~~~~~~~
    'CalendlyApiClient' is declared here.

app/api/scheduling/bookings/confirm/route.ts:109:11 - error TS2820: Type '"pending"' is not assignable to type 'BookingStatus | undefined'. Did you mean '"PENDING"'?

109           status: 'pending',
              ~~~~~~

  node_modules/.prisma/client/index.d.ts:33078:5
    33078     status?: $Enums.BookingStatus
              ~~~~~~
    The expected type comes from property 'status' which is declared here on type '(Without<BookingCreateInput, BookingUncheckedCreateInput> & BookingUncheckedCreateInput) | (Without<...> & BookingCreateInput)'

app/api/scheduling/bookings/confirm/route.ts:171:23 - error TS2339: Property 'scheduling_url' does not exist on type '{ uri: string; start_time: string; end_time: string; event_type: string | null; invitees_counter: { total: number; active: number; }; status: string; location: { type: string; location: string; }; }'.

171       calendlyBooking.scheduling_url = schedulingUrl;
                          ~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:183:17 - error TS2322: Type '"failed"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'.

183         data: { status: 'failed' }
                    ~~~~~~

  node_modules/.prisma/client/index.d.ts:33132:5
    33132     status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
              ~~~~~~
    The expected type comes from property 'status' which is declared here on type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'

app/api/scheduling/bookings/confirm/route.ts:196:9 - error TS2322: Type '"confirmed" | "pending_payment"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'.
  Type '"confirmed"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'. Did you mean '"CONFIRMED"'?

196         status: sessionType.price > 0 ? 'pending_payment' : 'confirmed',
            ~~~~~~

  node_modules/.prisma/client/index.d.ts:33132:5
    33132     status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
              ~~~~~~
    The expected type comes from property 'status' which is declared here on type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'

app/api/scheduling/bookings/confirm/route.ts:196:17 - error TS2365: Operator '>' cannot be applied to types 'Decimal' and 'number'.

196         status: sessionType.price > 0 ? 'pending_payment' : 'confirmed',
                    ~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:202:9 - error TS2367: This comparison appears to be unintentional because the types 'Decimal' and 'number' have no overlap.

202     if (sessionType.price === 0) {
            ~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:208:44 - error TS2339: Property 'name' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

208           builderName: sessionType.builder.name,
                                               ~~~~

app/api/scheduling/bookings/confirm/route.ts:230:40 - error TS2339: Property 'scheduling_url' does not exist on type '{ uri: string; start_time: string; end_time: string; event_type: string | null; invitees_counter: { total: number; active: number; }; status: string; location: { type: string; location: string; }; }'.

230         schedulingUrl: calendlyBooking.scheduling_url,
                                           ~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:239:37 - error TS2339: Property 'name' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

239           name: sessionType.builder.name,
                                        ~~~~

app/api/scheduling/bookings/confirm/route.ts:240:38 - error TS2339: Property 'email' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

240           email: sessionType.builder.email
                                         ~~~~~

app/api/scheduling/bookings/confirm/route.ts:243:24 - error TS2365: Operator '>' cannot be applied to types 'Decimal' and 'number'.

243       paymentRequired: sessionType.price > 0,
                           ~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:244:20 - error TS2365: Operator '>' cannot be applied to types 'Decimal' and 'number'.

244       checkoutUrl: sessionType.price > 0 ? `/api/payment/create-checkout?bookingId=${updatedBooking.id}` : undefined
                       ~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:250:24 - error TS2365: Operator '>' cannot be applied to types 'Decimal' and 'number'.

250       paymentRequired: sessionType.price > 0
                           ~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/bookings/create/route.ts:29:38 - error TS2345: Argument of type '(req: NextRequest, context: { params?: any; }, userId?: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'OptionalAuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject | undefined' is not assignable to type 'string | undefined'.
      Type 'AuthObject' is not assignable to type 'string'.

 29 export const POST = withOptionalAuth(async (
                                         ~~~~~~~
 30   req: NextRequest,
    ~~~~~~~~~~~~~~~~~~~
... 
 33   userRoles?: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~~
 34 ) => {
    ~~~~~~

app/api/scheduling/bookings/initialize/route.ts:25:38 - error TS2345: Argument of type '(req: NextRequest, context: { params?: any; }, userId?: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'OptionalAuthHandler<{ params?: any; }>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject | undefined' is not assignable to type 'string | undefined'.
      Type 'AuthObject' is not assignable to type 'string'.

 25 export const POST = withOptionalAuth(async (
                                         ~~~~~~~
 26   req: NextRequest,
    ~~~~~~~~~~~~~~~~~~~
... 
 29   userRoles?: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~~
 30 ) => {
    ~~~~~~

app/api/scheduling/builder-settings/route.ts:44:29 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

44 export const GET = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[]) => {
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/builder-settings/route.ts:120:29 - error TS2345: Argument of type '(request: NextRequest, context: { params?: any; }, userId: string, userRoles: UserRole[]) => Promise<NextResponse<{ error: { type: string; message: string; code: string; }; }>>' is not assignable to parameter of type 'AuthHandler<{ params?: any; }>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

120 export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[]) => {
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/scheduling/session-types/[id]/route.ts:30:31 - error TS2345: Argument of type '(request: NextRequest, context: { params?: { id?: string; }; }, userId: string, userRoles: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: { id?: string | undefined; } | undefined; }>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

 30 export const PATCH = withAuth(async (
                                  ~~~~~~~
 31   request: NextRequest,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
 34   userRoles: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~
 35 ) => {
    ~~~~~~

app/api/scheduling/session-types/[id]/route.ts:114:32 - error TS2345: Argument of type '(request: NextRequest, context: { params?: { id?: string; }; }, userId: string, userRoles: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<{ params?: { id?: string | undefined; } | undefined; }>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

114 export const DELETE = withAuth(async (
                                   ~~~~~~~
115   request: NextRequest,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
118   userRoles: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~
119 ) => {
    ~~~~~~

app/api/scheduling/session-types/route.ts:36:37 - error TS2345: Argument of type '(request: NextRequest, context: any, userId?: string, userRoles?: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'OptionalAuthHandler<any>'.
  Types of parameters 'userId' and 'auth' are incompatible.
    Type 'AuthObject | undefined' is not assignable to type 'string | undefined'.
      Type 'AuthObject' is not assignable to type 'string'.

 36 export const GET = withOptionalAuth(async (
                                        ~~~~~~~
 37   request: NextRequest,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
 40   userRoles?: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~~
 41 ) => {
    ~~~~~~

app/api/scheduling/session-types/route.ts:103:30 - error TS2345: Argument of type '(request: NextRequest, context: any, userId: string, userRoles: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<any>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

103 export const POST = withAuth(async (
                                 ~~~~~~~
104   request: NextRequest,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
107   userRoles: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~
108 ) => {
    ~~~~~~

app/api/scheduling/session-types/route.ts:145:33 - error TS2554: Expected 2 arguments, but got 1.

145       const sessionType = await createSessionType(result.data);
                                    ~~~~~~~~~~~~~~~~~

  lib/scheduling/real-data/scheduling-service.ts:1332:3
    1332   data: Partial<Omit<SessionType, 'id' | 'builderId' | 'createdAt' | 'updatedAt'>> & { title: string; description: string; durationMinutes: number; price: number; currency: string; }
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    An argument for 'data' was not provided.

app/api/stripe/sessions/[id]/route.ts:18:10 - error TS2305: Module '"@/lib/stripe/actions"' has no exported member 'getCheckoutSessionStatus'.

18 import { getCheckoutSessionStatus } from '@/lib/stripe/actions';
            ~~~~~~~~~~~~~~~~~~~~~~~~

app/api/stripe/webhook/route.ts:42:16 - error TS2503: Cannot find namespace 'Stripe'.

42     let event: Stripe.Event;
                  ~~~~~~

app/api/stripe/webhook/route.ts:105:14 - error TS18046: 'error' is of type 'unknown'.

105       error: error.message || 'Unknown error'
                 ~~~~~

app/api/test/auth/route.ts:17:29 - error TS2345: Argument of type '(request: NextRequest, context: any, userId: string, userRoles: UserRole[]) => Promise<NextResponse<unknown>>' is not assignable to parameter of type 'AuthHandler<any>'.
  Target signature provides too few arguments. Expected 4 or more, but got 3.

 17 export const GET = withAuth(async (
                                ~~~~~~~
 18   request: NextRequest,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
 21   userRoles: UserRole[]
    ~~~~~~~~~~~~~~~~~~~~~~~
 22 ) => {
    ~~~~~~

app/api/webhooks/calendly/route.ts:69:47 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'WebhookVerificationOptions | undefined'.
  Type 'string' has no properties in common with type 'WebhookVerificationOptions'.

69       verifyWebhookSignature(signature, body, process.env.CALENDLY_WEBHOOK_SIGNING_KEY);
                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:90:36 - error TS2339: Property 'webhookEvent' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

90     const existingEvent = await db.webhookEvent.findUnique({
                                      ~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:215:14 - error TS2339: Property 'webhookEvent' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

215     await db.webhookEvent.create({
                 ~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:286:14 - error TS2339: Property 'webhookMetric' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

286     await db.webhookMetric.create({
                 ~~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:340:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.

340             image: data.image_url,
                ~~~~~

  node_modules/.prisma/client/index.d.ts:4285:5
    4285     data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput); where: UserWhereUniqueInput; }'

app/api/webhooks/clerk/route.ts:385:9 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.

385         image: data.image_url, // Also update the legacy field
            ~~~~~

  node_modules/.prisma/client/index.d.ts:4233:5
    4233     data: XOR<UserCreateInput, UserUncheckedCreateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput); }'

app/api/webhooks/clerk/route.ts:478:20 - error TS2339: Property 'auditLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

478           await db.auditLog.create({
                       ~~~~~~~~

app/api/webhooks/clerk/route.ts:581:9 - error TS2353: Object literal may only specify known properties, and 'active' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.

581         active: false,
            ~~~~~~

  node_modules/.prisma/client/index.d.ts:4285:5
    4285     data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput); where: UserWhereUniqueInput; }'

app/api/webhooks/clerk/route.ts:604:34 - error TS2339: Property 'organization' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

604     const existingOrg = await db.organization.findUnique({
                                     ~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:614:14 - error TS2339: Property 'organization' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

614     await db.organization.create({
                 ~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:641:14 - error TS2339: Property 'organization' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

641     await db.organization.update({
                 ~~~~~~~~~~~~

app/api/webhooks/clerk/route.ts:668:14 - error TS2339: Property 'organization' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

668     await db.organization.update({
                 ~~~~~~~~~~~~

app/booking/schedule/page.tsx:7:35 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/scheduling/api.ts' is not a module.

7 import { fetchSessionTypes } from '@/lib/scheduling/api';
                                    ~~~~~~~~~~~~~~~~~~~~~~

app/onboarding/page.tsx:43:17 - error TS2339: Property 'isLoading' does not exist on type 'AuthContextType'.

43   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                   ~~~~~~~~~

app/onboarding/page.tsx:43:28 - error TS2339: Property 'isAuthenticated' does not exist on type 'AuthContextType'.

43   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                              ~~~~~~~~~~~~~~~

app/onboarding/page.tsx:43:45 - error TS2339: Property 'updateSession' does not exist on type 'AuthContextType'.

43   const { user, isLoading, isAuthenticated, updateSession } = useAuth();
                                               ~~~~~~~~~~~~~

components/admin/admin-dashboard.tsx:111:15 - error TS2322: Type '{ key: number; title: string; description: string; icon: string; href: string; }' is not assignable to type 'IntrinsicAttributes & AdminCardProps'.
  Property 'href' does not exist on type 'IntrinsicAttributes & AdminCardProps'.

111               href={action.href}
                  ~~~~

components/admin/settings-panel.tsx:4:35 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/admin/actions.ts' is not a module.

4 import { getSystemSettings } from "@/lib/admin/actions";
                                    ~~~~~~~~~~~~~~~~~~~~~

components/auth/optimized-loading-state.tsx:41:7 - error TS18047: 'pathname' is possibly 'null'.

41       pathname.startsWith(`${path}/`) ||
         ~~~~~~~~

components/auth/optimized-loading-state.tsx:42:7 - error TS18047: 'pathname' is possibly 'null'.

42       pathname.startsWith("/marketplace/") ||
         ~~~~~~~~

components/auth/optimized-loading-state.tsx:43:7 - error TS18047: 'pathname' is possibly 'null'.

43       pathname.startsWith("/api/marketplace/") ||
         ~~~~~~~~

components/auth/optimized-loading-state.tsx:44:7 - error TS18047: 'pathname' is possibly 'null'.

44       pathname.match(/^\/images\//) ||
         ~~~~~~~~

components/auth/optimized-loading-state.tsx:45:7 - error TS18047: 'pathname' is possibly 'null'.

45       pathname.match(/^\/fonts\//) ||
         ~~~~~~~~

components/auth/optimized-loading-state.tsx:46:7 - error TS18047: 'pathname' is possibly 'null'.

46       pathname.match(/^\/static\//)
         ~~~~~~~~

components/booking/booking-button.tsx:83:9 - error TS2322: Type '"sm" | "md" | "lg"' is not assignable to type '"default" | "sm" | "lg" | "icon" | null | undefined'.
  Type '"md"' is not assignable to type '"default" | "sm" | "lg" | "icon" | null | undefined'.

83         size={size}
           ~~~~

  components/ui/core/button.tsx:23:7
     23       size: {
              ~~~~~~~
     24         default: "h-9 px-4 py-2",
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ... 
     27         icon: "h-9 w-9",
        ~~~~~~~~~~~~~~~~~~~~~~~~
     28       },
        ~~~~~~~
    The expected type comes from property 'size' which is declared here on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'

components/booking/booking-button.tsx:95:7 - error TS2322: Type '"default" | "primary" | "secondary" | "outline"' is not assignable to type '"link" | "default" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined'.
  Type '"primary"' is not assignable to type '"link" | "default" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined'.

95       variant={variant}
         ~~~~~~~

  components/ui/core/button.tsx:11:7
     11       variant: {
              ~~~~~~~~~~
     12         default:
        ~~~~~~~~~~~~~~~~
    ... 
     21         link: "text-primary underline-offset-4 hover:underline",
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     22       },
        ~~~~~~~
    The expected type comes from property 'variant' which is declared here on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'

components/booking/booking-button.tsx:96:7 - error TS2322: Type '"sm" | "md" | "lg"' is not assignable to type '"default" | "sm" | "lg" | "icon" | null | undefined'.
  Type '"md"' is not assignable to type '"default" | "sm" | "lg" | "icon" | null | undefined'.

96       size={size}
         ~~~~

  components/ui/core/button.tsx:23:7
     23       size: {
              ~~~~~~~
     24         default: "h-9 px-4 py-2",
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ... 
     27         icon: "h-9 w-9",
        ~~~~~~~~~~~~~~~~~~~~~~~~
     28       },
        ~~~~~~~
    The expected type comes from property 'size' which is declared here on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'

components/booking/index.ts:7:10 - error TS2305: Module '"./booking-button"' has no exported member 'default'.

7 export { default as BookingButton } from './booking-button';
           ~~~~~~~

components/community/ui/discussion-card.tsx:157:15 - error TS2322: Type '{ src: string | undefined; alt: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.
  Property 'src' does not exist on type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.

157               src={discussion.author.avatarUrl}
                  ~~~

components/community/ui/knowledge-item.tsx:168:15 - error TS2322: Type '{ src: string | undefined; alt: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.
  Property 'src' does not exist on type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.

168               src={item.author.avatarUrl}
                  ~~~

components/community/ui/server-discussion-card.tsx:130:15 - error TS2322: Type '{ src: string | undefined; alt: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.
  Property 'src' does not exist on type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.

130               src={discussion.author.avatarUrl}
                  ~~~

components/index.ts:7:10 - error TS2305: Module '"./user-auth-form"' has no exported member 'default'.

7 export { default as UserAuthForm } from './user-auth-form';
           ~~~~~~~

components/index.ts:8:10 - error TS2305: Module '"./theme-provider"' has no exported member 'default'.

8 export { default as ThemeProvider } from './theme-provider';
           ~~~~~~~

components/index.ts:9:10 - error TS2305: Module '"./suspense-user-auth-form"' has no exported member 'default'.

9 export { default as SuspenseUserAuthForm } from './suspense-user-auth-form';
           ~~~~~~~

components/index.ts:10:10 - error TS2305: Module '"./site-footer"' has no exported member 'default'.

10 export { default as SiteFooter } from './site-footer';
            ~~~~~~~

components/index.ts:11:10 - error TS2305: Module '"./search-params-fallback"' has no exported member 'default'.

11 export { default as SearchParamsFallback } from './search-params-fallback';
            ~~~~~~~

components/index.ts:22:10 - error TS2305: Module '"./ui/core/loading-spinner"' has no exported member 'default'.

22 export { default as LoadingSpinner } from './ui/core/loading-spinner';
            ~~~~~~~

components/index.ts:35:10 - error TS2305: Module '"./trust/ui/validation-tier-badge"' has no exported member 'default'.

35 export { default as ValidationTierBadge } from './trust/ui/validation-tier-badge';
            ~~~~~~~

components/index.ts:36:10 - error TS2305: Module '"./scheduling/shared/timezone-selector"' has no exported member 'default'.

36 export { default as TimezoneSelector } from './scheduling/shared/timezone-selector';
            ~~~~~~~

components/index.ts:38:10 - error TS2305: Module '"./scheduling/client/session-type-selector"' has no exported member 'default'.

38 export { default as SessionTypeSelector } from './scheduling/client/session-type-selector';
            ~~~~~~~

components/index.ts:41:10 - error TS2305: Module '"./scheduling/builder/weekly-schedule"' has no exported member 'default'.

41 export { default as WeeklySchedule } from './scheduling/builder/weekly-schedule';
            ~~~~~~~

components/index.ts:42:10 - error TS2305: Module '"./scheduling/builder/session-type-editor"' has no exported member 'default'.

42 export { default as SessionTypeEditor } from './scheduling/builder/session-type-editor';
            ~~~~~~~

components/index.ts:46:10 - error TS2305: Module '"./providers/providers"' has no exported member 'default'.

46 export { default as providers } from './providers/providers';
            ~~~~~~~

components/index.ts:47:10 - error TS2305: Module '"./providers/clerk-provider"' has no exported member 'default'.

47 export { default as ClerkProvider } from './providers/clerk-provider';
            ~~~~~~~

components/index.ts:48:10 - error TS2305: Module '"./profile/user-profile"' has no exported member 'default'.

48 export { default as UserProfile } from './profile/user-profile';
            ~~~~~~~

components/index.ts:49:10 - error TS2305: Module '"./profile/success-metrics-dashboard"' has no exported member 'default'.

49 export { default as SuccessMetricsDashboard } from './profile/success-metrics-dashboard';
            ~~~~~~~

components/index.ts:50:10 - error TS2305: Module '"./profile/role-badges"' has no exported member 'default'.

50 export { default as RoleBadges } from './profile/role-badges';
            ~~~~~~~

components/index.ts:51:10 - error TS2305: Module '"./profile/profile-auth-provider"' has no exported member 'default'.

51 export { default as ProfileAuthProvider } from './profile/profile-auth-provider';
            ~~~~~~~

components/index.ts:52:10 - error TS2305: Module '"./profile/portfolio-showcase"' has no exported member 'default'.

52 export { default as PortfolioShowcase } from './profile/portfolio-showcase';
            ~~~~~~~

components/index.ts:53:10 - error TS2305: Module '"./profile/portfolio-gallery"' has no exported member 'default'.

53 export { default as PortfolioGallery } from './profile/portfolio-gallery';
            ~~~~~~~

components/index.ts:55:10 - error TS2305: Module '"./profile/builder-profile"' has no exported member 'default'.

55 export { default as BuilderProfile } from './profile/builder-profile';
            ~~~~~~~

components/index.ts:56:10 - error TS2305: Module '"./profile/builder-profile-wrapper"' has no exported member 'default'.

56 export { default as BuilderProfileWrapper } from './profile/builder-profile-wrapper';
            ~~~~~~~

components/index.ts:57:10 - error TS2305: Module '"./profile/builder-profile-client-wrapper"' has no exported member 'default'.

57 export { default as BuilderProfileClientWrapper } from './profile/builder-profile-client-wrapper';
            ~~~~~~~

components/index.ts:58:10 - error TS2305: Module '"./profile/app-showcase"' has no exported member 'default'.

58 export { default as AppShowcase } from './profile/app-showcase';
            ~~~~~~~

components/index.ts:59:10 - error TS2305: Module '"./profile/add-project-form"' has no exported member 'default'.

59 export { default as AddProjectForm } from './profile/add-project-form';
            ~~~~~~~

components/index.ts:61:10 - error TS2305: Module '"./profile/ui/session-booking-card"' has no exported member 'default'.

61 export { default as SessionBookingCard } from './profile/ui/session-booking-card';
            ~~~~~~~

components/index.ts:62:10 - error TS2305: Module '"./profile/ui/profile-stats"' has no exported member 'default'.

62 export { default as ProfileStats } from './profile/ui/profile-stats';
            ~~~~~~~

components/index.ts:63:10 - error TS2305: Module '"./payment/payment-status-indicator"' has no exported member 'default'.

63 export { default as PaymentStatusIndicator } from './payment/payment-status-indicator';
            ~~~~~~~

components/index.ts:64:15 - error TS2307: Cannot find module './marketplace/builder-list' or its corresponding type declarations.

64 export * from './marketplace/builder-list';
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:65:41 - error TS2307: Cannot find module './marketplace/builder-image' or its corresponding type declarations.

65 export { default as BuilderImage } from './marketplace/builder-image';
                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:66:45 - error TS2307: Cannot find module './marketplace/builder-dashboard' or its corresponding type declarations.

66 export { default as BuilderDashboard } from './marketplace/builder-dashboard';
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:67:40 - error TS2307: Cannot find module './marketplace/builder-card' or its corresponding type declarations.

67 export { default as BuilderCard } from './marketplace/builder-card';
                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:68:40 - error TS2307: Cannot find module './marketplace/ui/filter-panel' or its corresponding type declarations.

68 export { default as FilterPanel } from './marketplace/ui/filter-panel';
                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:71:44 - error TS2307: Cannot find module './marketing/marketing-footer' or its corresponding type declarations.

71 export { default as MarketingFooter } from './marketing/marketing-footer';
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:72:10 - error TS2305: Module '"./marketing/marketing-cta"' has no exported member 'default'.

72 export { default as MarketingCta } from './marketing/marketing-cta';
            ~~~~~~~

components/index.ts:73:10 - error TS2305: Module '"./marketing/feature-showcase"' has no exported member 'default'.

73 export { default as FeatureShowcase } from './marketing/feature-showcase';
            ~~~~~~~

components/index.ts:75:10 - error TS2305: Module '"./marketing/ui/trust-proof-companies"' has no exported member 'default'.

75 export { default as TrustProofCompanies } from './marketing/ui/trust-proof-companies';
            ~~~~~~~

components/index.ts:76:10 - error TS2305: Module '"./marketing/ui/testimonial-card"' has no exported member 'default'.

76 export { default as TestimonialCard } from './marketing/ui/testimonial-card';
            ~~~~~~~

components/index.ts:77:10 - error TS2305: Module '"./marketing/ui/newsletter-form"' has no exported member 'default'.

77 export { default as NewsletterForm } from './marketing/ui/newsletter-form';
            ~~~~~~~

components/index.ts:78:10 - error TS2305: Module '"./marketing/ui/marketing-stat"' has no exported member 'default'.

78 export { default as MarketingStat } from './marketing/ui/marketing-stat';
            ~~~~~~~

components/index.ts:79:10 - error TS2305: Module '"./marketing/ui/marketing-marquee"' has no exported member 'default'.

79 export { default as MarketingMarquee } from './marketing/ui/marketing-marquee';
            ~~~~~~~

components/index.ts:80:10 - error TS2305: Module '"./marketing/ui/feature-card"' has no exported member 'default'.

80 export { default as FeatureCard } from './marketing/ui/feature-card';
            ~~~~~~~

components/index.ts:81:10 - error TS2305: Module '"./magicui/word-rotate"' has no exported member 'default'.

81 export { default as WordRotate } from './magicui/word-rotate';
            ~~~~~~~

components/index.ts:82:10 - error TS2305: Module '"./magicui/typing-animation"' has no exported member 'default'.

82 export { default as TypingAnimation } from './magicui/typing-animation';
            ~~~~~~~

components/index.ts:83:10 - error TS2305: Module '"./magicui/text-animate"' has no exported member 'default'.

83 export { default as TextAnimate } from './magicui/text-animate';
            ~~~~~~~

components/index.ts:87:10 - error TS2305: Module '"./magicui/orbiting-circles"' has no exported member 'default'.

87 export { default as OrbitingCircles } from './magicui/orbiting-circles';
            ~~~~~~~

components/index.ts:88:10 - error TS2305: Module '"./magicui/marquee"' has no exported member 'default'.

88 export { default as marquee } from './magicui/marquee';
            ~~~~~~~

components/index.ts:89:10 - error TS2305: Module '"./magicui/globe"' has no exported member 'default'.

89 export { default as globe } from './magicui/globe';
            ~~~~~~~

components/index.ts:90:10 - error TS2305: Module '"./magicui/dot-pattern"' has no exported member 'default'.

90 export { default as DotPattern } from './magicui/dot-pattern';
            ~~~~~~~

components/index.ts:92:10 - error TS2305: Module '"./magicui/blur-fade"' has no exported member 'default'.

92 export { default as BlurFade } from './magicui/blur-fade';
            ~~~~~~~

components/index.ts:95:41 - error TS2307: Cannot find module './animated-subscribe-button' or its corresponding type declarations.

95 export { AnimatedSubscribeButton } from './animated-subscribe-button';
                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/index.ts:96:10 - error TS2305: Module '"./magicui/animated-circular-progress-bar"' has no exported member 'default'.

96 export { default as AnimatedCircularProgressBar } from './magicui/animated-circular-progress-bar';
            ~~~~~~~

components/index.ts:98:10 - error TS2305: Module '"./learning/ui/timeline-item"' has no exported member 'default'.

98 export { default as TimelineItem } from './learning/ui/timeline-item';
            ~~~~~~~

components/index.ts:99:10 - error TS2305: Module '"./learning/ui/timeline-filter"' has no exported member 'default'.

99 export { default as TimelineFilter } from './learning/ui/timeline-filter';
            ~~~~~~~

components/index.ts:101:10 - error TS2305: Module '"./landing/trusted-ecosystem"' has no exported member 'default'.

101 export { default as TrustedEcosystem } from './landing/trusted-ecosystem';
             ~~~~~~~

components/index.ts:102:10 - error TS2305: Module '"./landing/testimonial-section"' has no exported member 'default'.

102 export { default as TestimonialSection } from './landing/testimonial-section';
             ~~~~~~~

components/index.ts:103:10 - error TS2305: Module '"./landing/skills-tree-section"' has no exported member 'default'.

103 export { default as SkillsTreeSection } from './landing/skills-tree-section';
             ~~~~~~~

components/index.ts:104:10 - error TS2305: Module '"./landing/skills-carousel"' has no exported member 'default'.

104 export { default as SkillsCarousel } from './landing/skills-carousel';
             ~~~~~~~

components/index.ts:105:10 - error TS2305: Module '"./landing/performance-optimizations"' has no exported member 'default'.

105 export { default as PerformanceOptimizations } from './landing/performance-optimizations';
             ~~~~~~~

components/index.ts:107:10 - error TS2305: Module '"./landing/hero-section"' has no exported member 'default'.

107 export { default as HeroSection } from './landing/hero-section';
             ~~~~~~~

components/index.ts:108:35 - error TS2307: Cannot find module './landing/footer' or its corresponding type declarations.

108 export { default as footer } from './landing/footer';
                                      ~~~~~~~~~~~~~~~~~~

components/index.ts:109:10 - error TS2305: Module '"./landing/feature-scroll"' has no exported member 'default'.

109 export { default as FeatureScroll } from './landing/feature-scroll';
             ~~~~~~~

components/index.ts:111:10 - error TS2305: Module '"./landing/cta-section"' has no exported member 'default'.

111 export { default as CtaSection } from './landing/cta-section';
             ~~~~~~~

components/index.ts:112:10 - error TS2305: Module '"./landing/bento-section"' has no exported member 'default'.

112 export { default as BentoSection } from './landing/bento-section';
             ~~~~~~~

components/index.ts:113:10 - error TS2305: Module '"./landing/ai-stats"' has no exported member 'default'.

113 export { default as AiStats } from './landing/ai-stats';
             ~~~~~~~

components/index.ts:114:10 - error TS2305: Module '"./landing/ai-capabilities-marquee"' has no exported member 'default'.

114 export { default as AiCapabilitiesMarquee } from './landing/ai-capabilities-marquee';
             ~~~~~~~

components/index.ts:116:10 - error TS2305: Module '"./landing/ui/testimonial-scroll"' has no exported member 'default'.

116 export { default as TestimonialScroll } from './landing/ui/testimonial-scroll';
             ~~~~~~~

components/index.ts:118:10 - error TS2305: Module '"./community/ui/knowledge-item"' has no exported member 'default'.

118 export { default as KnowledgeItem } from './community/ui/knowledge-item';
             ~~~~~~~

components/index.ts:119:10 - error TS2305: Module '"./community/ui/discussion-card"' has no exported member 'default'.

119 export { default as DiscussionCard } from './community/ui/discussion-card';
             ~~~~~~~

components/index.ts:120:10 - error TS2305: Module '"./booking/booking-button"' has no exported member 'default'.

120 export { default as BookingButton } from './booking/booking-button';
             ~~~~~~~

components/index.ts:126:10 - error TS2305: Module '"./admin/session-type-form"' has no exported member 'default'.

126 export { default as SessionTypeForm } from './admin/session-type-form';
             ~~~~~~~

components/index.ts:127:10 - error TS2305: Module '"./admin/admin-nav"' has no exported member 'default'.

127 export { default as AdminNav } from './admin/admin-nav';
             ~~~~~~~

components/index.ts:128:10 - error TS2305: Module '"./admin/ui/admin-card"' has no exported member 'default'.

128 export { default as AdminCard } from './admin/ui/admin-card';
             ~~~~~~~

components/index.ts:134:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/components/utils/index.ts' is not a module.

134 export * from './utils';
                  ~~~~~~~~~

components/landing/ai-capabilities-marquee.tsx:6:47 - error TS5097: An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled.

6 import { aiCapabilities, aiLimitations } from "./data.tsx";
                                                ~~~~~~~~~~~~

components/landing/brand-word-rotate.tsx:69:45 - error TS2339: Property 'additionalStyles' does not exist on type '{ className: string; font: string; } | { className: string; font: string; } | { className: string; font: string; } | { className: string; font: string; } | { className: string; font: string; } | { className: string; font: string; additionalStyles: string; }'.
  Property 'additionalStyles' does not exist on type '{ className: string; font: string; }'.

69     ? cn(brandConfig.className, brandConfig.additionalStyles)
                                               ~~~~~~~~~~~~~~~~

components/landing/hero-section.tsx:6:29 - error TS5097: An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled.

6 import { heroContent } from "./data.tsx";
                              ~~~~~~~~~~~~

components/landing/hero-section.tsx:109:16 - error TS2741: Property 'children' is missing in type '{ delay: number; }' but required in type 'AnimatedSpanProps'.

109               <AnimatedSpan delay={200}>
                   ~~~~~~~~~~~~

  components/magicui/terminal.tsx:8:3
    8   children: React.ReactNode;
        ~~~~~~~~
    'children' is declared here.

components/landing/hero-section.tsx:127:16 - error TS2741: Property 'children' is missing in type '{ delay: number; }' but required in type 'AnimatedSpanProps'.

127               <AnimatedSpan delay={800}>
                   ~~~~~~~~~~~~

  components/magicui/terminal.tsx:8:3
    8   children: React.ReactNode;
        ~~~~~~~~
    'children' is declared here.

components/landing/index.ts:7:10 - error TS2305: Module '"./trusted-ecosystem"' has no exported member 'default'.

7 export { default as TrustedEcosystem } from './trusted-ecosystem';
           ~~~~~~~

components/landing/index.ts:8:10 - error TS2305: Module '"./testimonial-section"' has no exported member 'default'.

8 export { default as TestimonialSection } from './testimonial-section';
           ~~~~~~~

components/landing/index.ts:9:10 - error TS2305: Module '"./skills-tree-section"' has no exported member 'default'.

9 export { default as SkillsTreeSection } from './skills-tree-section';
           ~~~~~~~

components/landing/index.ts:10:10 - error TS2305: Module '"./skills-carousel"' has no exported member 'default'.

10 export { default as SkillsCarousel } from './skills-carousel';
            ~~~~~~~

components/landing/index.ts:11:10 - error TS2305: Module '"./performance-optimizations"' has no exported member 'default'.

11 export { default as PerformanceOptimizations } from './performance-optimizations';
            ~~~~~~~

components/landing/index.ts:13:10 - error TS2305: Module '"./hero-section"' has no exported member 'default'.

13 export { default as HeroSection } from './hero-section';
            ~~~~~~~

components/landing/index.ts:14:10 - error TS2305: Module '"./feature-scroll"' has no exported member 'default'.

14 export { default as FeatureScroll } from './feature-scroll';
            ~~~~~~~

components/landing/index.ts:15:10 - error TS2305: Module '"./cta-section"' has no exported member 'default'.

15 export { default as CtaSection } from './cta-section';
            ~~~~~~~

components/landing/index.ts:16:10 - error TS2305: Module '"./bento-section"' has no exported member 'default'.

16 export { default as BentoSection } from './bento-section';
            ~~~~~~~

components/landing/index.ts:17:10 - error TS2305: Module '"./ai-stats"' has no exported member 'default'.

17 export { default as AiStats } from './ai-stats';
            ~~~~~~~

components/landing/index.ts:18:10 - error TS2305: Module '"./ai-capabilities-marquee"' has no exported member 'default'.

18 export { default as AiCapabilitiesMarquee } from './ai-capabilities-marquee';
            ~~~~~~~

components/landing/navbar.tsx:9:30 - error TS5097: An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled.

9 import { mainNavItems } from "./data.tsx";
                               ~~~~~~~~~~~~

components/landing/skills-tree-section.tsx:5:28 - error TS5097: An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled.

5 import { skillsData } from "./data.tsx";
                             ~~~~~~~~~~~~

components/landing/ui/index.ts:7:10 - error TS2305: Module '"./testimonial-scroll"' has no exported member 'default'.

7 export { default as TestimonialScroll } from './testimonial-scroll';
           ~~~~~~~

components/learning/timeline.tsx:3:10 - error TS2305: Module '"@/lib/learning/types"' has no exported member 'LearningCapability'.

3 import { LearningCapability } from "@/lib/learning/types";
           ~~~~~~~~~~~~~~~~~~

components/learning/ui/timeline-filter.tsx:40:11 - error TS2339: Property 'loading' does not exist on type '{ setFilter: (filter: LearningFilter) => void; setTimeframe: (timeframe: LearningTimeframe) => void; setSort: (sort: LearningSort) => void; ... 5 more ...; search: string; }'.

40   const { loading, error } = useLearningState();
             ~~~~~~~

components/learning/ui/timeline-filter.tsx:40:20 - error TS2339: Property 'error' does not exist on type '{ setFilter: (filter: LearningFilter) => void; setTimeframe: (timeframe: LearningTimeframe) => void; setSort: (sort: LearningSort) => void; ... 5 more ...; search: string; }'.

40   const { loading, error } = useLearningState();
                      ~~~~~

components/learning/ui/timeline-item.tsx:7:10 - error TS2305: Module '"@/lib/learning/types"' has no exported member 'LearningCapability'.

7 import { LearningCapability } from "@/lib/learning/types";
           ~~~~~~~~~~~~~~~~~~

components/learning/ui/timeline-item.tsx:73:47 - error TS7006: Parameter 'example' implicitly has an 'any' type.

73                     {capability.examples.map((example, index) => (
                                                 ~~~~~~~

components/learning/ui/timeline-item.tsx:73:56 - error TS7006: Parameter 'index' implicitly has an 'any' type.

73                     {capability.examples.map((example, index) => (
                                                          ~~~~~

components/magicui/index.ts:7:10 - error TS2305: Module '"./word-rotate"' has no exported member 'default'.

7 export { default as WordRotate } from './word-rotate';
           ~~~~~~~

components/magicui/index.ts:8:10 - error TS2305: Module '"./typing-animation"' has no exported member 'default'.

8 export { default as TypingAnimation } from './typing-animation';
           ~~~~~~~

components/magicui/index.ts:9:10 - error TS2305: Module '"./text-animate"' has no exported member 'default'.

9 export { default as TextAnimate } from './text-animate';
           ~~~~~~~

components/magicui/index.ts:13:10 - error TS2305: Module '"./orbiting-circles"' has no exported member 'default'.

13 export { default as OrbitingCircles } from './orbiting-circles';
            ~~~~~~~

components/magicui/index.ts:14:10 - error TS2305: Module '"./marquee"' has no exported member 'default'.

14 export { default as marquee } from './marquee';
            ~~~~~~~

components/magicui/index.ts:15:10 - error TS2305: Module '"./globe"' has no exported member 'default'.

15 export { default as globe } from './globe';
            ~~~~~~~

components/magicui/index.ts:16:10 - error TS2305: Module '"./dot-pattern"' has no exported member 'default'.

16 export { default as DotPattern } from './dot-pattern';
            ~~~~~~~

components/magicui/index.ts:18:10 - error TS2305: Module '"./blur-fade"' has no exported member 'default'.

18 export { default as BlurFade } from './blur-fade';
            ~~~~~~~

components/magicui/index.ts:22:10 - error TS2305: Module '"./animated-circular-progress-bar"' has no exported member 'default'.

22 export { default as AnimatedCircularProgressBar } from './animated-circular-progress-bar';
            ~~~~~~~

components/magicui/particles.tsx:103:9 - error TS2451: Cannot redeclare block-scoped variable 'animate'.

103   const animate = () => {
            ~~~~~~~

components/magicui/particles.tsx:306:9 - error TS2451: Cannot redeclare block-scoped variable 'animate'.

306   const animate = () => {
            ~~~~~~~

components/marketplace/components/builder-dashboard/builder-dashboard.tsx:292:17 - error TS2322: Type '"entry" | "expert" | "established"' is not assignable to type 'ValidationTier'.
  Type '"entry"' is not assignable to type 'ValidationTier'.

292                 validationTier={builderProfile?.validationTier === 3 ? "expert" : (builderProfile?.validationTier === 2 ? "established" : "entry")}
                    ~~~~~~~~~~~~~~

  components/profile/success-metrics-dashboard.tsx:33:3
    33   validationTier: ValidationTier;
         ~~~~~~~~~~~~~~
    The expected type comes from property 'validationTier' which is declared here on type 'IntrinsicAttributes & SuccessMetricsDashboardProps'

components/marketplace/components/builder-dashboard/builder-dashboard.tsx:293:17 - error TS2322: Type '{ id: string; name: string; icon: Element; metrics: ({ label: string; value: string; description: string; trend: string; isHighlighted: boolean; } | { label: string; value: string; description: string; trend: string; isHighlighted?: undefined; })[]; }[]' is not assignable to type 'MetricsCategory[]'.
  Type '{ id: string; name: string; icon: JSX.Element; metrics: ({ label: string; value: string; description: string; trend: string; isHighlighted: boolean; } | { label: string; value: string; description: string; trend: string; isHighlighted?: undefined; })[]; }' is not assignable to type 'MetricsCategory'.
    Types of property 'metrics' are incompatible.
      Type '({ label: string; value: string; description: string; trend: string; isHighlighted: boolean; } | { label: string; value: string; description: string; trend: string; isHighlighted?: undefined; })[]' is not assignable to type 'MetricItem[]'.
        Type '{ label: string; value: string; description: string; trend: string; isHighlighted: boolean; } | { label: string; value: string; description: string; trend: string; isHighlighted?: undefined; }' is not assignable to type 'MetricItem'.
          Type '{ label: string; value: string; description: string; trend: string; isHighlighted: boolean; }' is not assignable to type 'MetricItem'.
            Types of property 'trend' are incompatible.
              Type 'string' is not assignable to type '"up" | "down" | "neutral" | undefined'.

293                 metrics={successMetrics}
                    ~~~~~~~

  components/profile/success-metrics-dashboard.tsx:34:3
    34   metrics: MetricsCategory[];
         ~~~~~~~
    The expected type comes from property 'metrics' which is declared here on type 'IntrinsicAttributes & SuccessMetricsDashboardProps'

components/marketplace/hooks/use-builder-filter.ts:37:25 - error TS18047: 'searchParams' is possibly 'null'.

37     const searchQuery = searchParams.get('q');
                           ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:43:20 - error TS18047: 'searchParams' is possibly 'null'.

43     const skills = searchParams.get('skills');
                      ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:49:19 - error TS18047: 'searchParams' is possibly 'null'.

49     const tiers = searchParams.get('tiers');
                     ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:55:26 - error TS18047: 'searchParams' is possibly 'null'.

55     const availability = searchParams.get('availability');
                            ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:61:22 - error TS18047: 'searchParams' is possibly 'null'.

61     const featured = searchParams.get('featured');
                        ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:67:20 - error TS18047: 'searchParams' is possibly 'null'.

67     const sortBy = searchParams.get('sort');
                      ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:73:21 - error TS18047: 'searchParams' is possibly 'null'.

73     const minRate = searchParams.get('minRate');
                       ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:78:21 - error TS18047: 'searchParams' is possibly 'null'.

78     const maxRate = searchParams.get('maxRate');
                       ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:104:40 - error TS18047: 'searchParams' is possibly 'null'.

104     const params = new URLSearchParams(searchParams.toString());
                                           ~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:192:11 - error TS2322: Type '(string | number)[] | undefined' is not assignable to type 'undefined'.
  Type '(string | number)[]' is not assignable to type 'undefined'.

192           newFilters[key] = newArray.length > 0 ? newArray : undefined;
              ~~~~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:195:11 - error TS2322: Type '(string | number)[]' is not assignable to type 'undefined'.

195           newFilters[key] = [...currentArray, value];
              ~~~~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:204:11 - error TS2322: Type 'string | number' is not assignable to type 'undefined'.
  Type 'string' is not assignable to type 'undefined'.

204           newFilters[key] = value;
              ~~~~~~~~~~~~~~~

components/payment/checkout-button.tsx:76:9 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<...> | (() => ReactNode)'.

76         title: 'Payment Error',
           ~~~~~

components/payment/index.ts:13:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/components/payment/ui/index.ts' is not a module.

13 export * from './ui';
                 ~~~~~~

components/payment/payment-confirmation.tsx:43:35 - error TS2322: Type 'string' is not assignable to type 'PaymentStatus'.

43           <PaymentStatusIndicator status={paymentStatus} />
                                     ~~~~~~

  components/payment/payment-status-indicator.tsx:19:3
    19   status: PaymentStatus;
         ~~~~~~
    The expected type comes from property 'status' which is declared here on type 'IntrinsicAttributes & PaymentStatusIndicatorProps'

components/payment/payment-status-indicator.tsx:6:74 - error TS2307: Cannot find module '@/components/ui/tooltip' or its corresponding type declarations.

6 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
                                                                           ~~~~~~~~~~~~~~~~~~~~~~~~~

components/payment/stripe-provider.tsx:47:36 - error TS2322: Type '{ mode: string; currency: string; appearance: { theme: string; labels: string; variables: { colorPrimary: string; colorBackground: string; colorText: string; colorDanger: string; fontFamily: string; borderRadius: string; }; }; }' is not assignable to type 'StripeElementsOptions | undefined'.
  Type '{ mode: string; currency: string; appearance: { theme: string; labels: string; variables: { colorPrimary: string; colorBackground: string; colorText: string; colorDanger: string; fontFamily: string; borderRadius: string; }; }; }' is not assignable to type 'StripeElementsOptionsClientSecret | StripeElementsOptionsMode'.
    Type '{ mode: string; currency: string; appearance: { theme: string; labels: string; variables: { colorPrimary: string; colorBackground: string; colorText: string; colorDanger: string; fontFamily: string; borderRadius: string; }; }; }' is not assignable to type 'StripeElementsOptionsMode'.
      Types of property 'mode' are incompatible.
        Type 'string' is not assignable to type '"setup" | "payment" | "subscription" | undefined'.

47     <Elements stripe={getStripe()} options={options}>
                                      ~~~~~~~

  node_modules/.pnpm/@stripe+react-stripe-js@3.7.0_@stripe+stripe-js@7.1.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/@stripe/react-stripe-js/dist/react-stripe.d.ts:665:5
    665     options?: stripeJs.StripeElementsOptions;
            ~~~~~~~
    The expected type comes from property 'options' which is declared here on type 'IntrinsicAttributes & ElementsProps & { children?: ReactNode; }'

components/platform/platform-header.tsx:236:61 - error TS2339: Property 'builderProfile' does not exist on type 'AuthUser'.

236   const userMenuItems = getUserMenuItems(user?.roles, user?.builderProfile?.id || user?.id);
                                                                ~~~~~~~~~~~~~~

components/profile/builder-profile-wrapper.tsx:71:30 - error TS2322: Type 'number' is not assignable to type 'ValidationTier'.

71         <ValidationTierBadge tier={builder.validationTier} />
                                ~~~~

  components/trust/ui/validation-tier-badge.tsx:12:3
    12   tier: ValidationTier;
         ~~~~
    The expected type comes from property 'tier' which is declared here on type 'IntrinsicAttributes & ValidationTierBadgeProps'

components/profile/builder-profile-wrapper.tsx:76:9 - error TS2322: Type '{ builder: { email: string | undefined; phoneNumber: string | undefined; privateNotes: string | undefined; earnings: number | undefined; stripeAccountId: string | undefined; id: string; ... 6 more ...; sessionTypes: { ...; }[]; }; showContactInfo: boolean; }' is not assignable to type 'IntrinsicAttributes & BuilderProfileProps'.
  Property 'builder' does not exist on type 'IntrinsicAttributes & BuilderProfileProps'.

76         builder={filteredBuilder}
           ~~~~~~~

components/profile/builder-profile.tsx:42:3 - error TS2305: Module '"@/lib/profile/types"' has no exported member 'ExpertiseAreas'.

42   ExpertiseAreas,
     ~~~~~~~~~~~~~~

components/profile/builder-profile.tsx:244:19 - error TS2322: Type '{ id: string; name: string; description?: string | undefined; duration: number; price?: number | undefined; calendlyEventTypeUri?: string | undefined; }[]' is not assignable to type 'SessionType[]'.
  Type '{ id: string; name: string; description?: string | undefined; duration: number; price?: number | undefined; calendlyEventTypeUri?: string | undefined; }' is missing the following properties from type 'SessionType': builderId, title, durationMinutes, currency, isActive

244                   sessionTypes={profile.sessionTypes || []}
                      ~~~~~~~~~~~~

  components/scheduling/client/integrated-booking.tsx:15:3
    15   sessionTypes: SessionType[];
         ~~~~~~~~~~~~
    The expected type comes from property 'sessionTypes' which is declared here on type 'IntrinsicAttributes & IntegratedBookingProps'

components/profile/builder-profile.tsx:508:105 - error TS7006: Parameter 'point' implicitly has an 'any' type.

508                         {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].bulletPoints.map((point, i) => (
                                                                                                            ~~~~~

components/profile/builder-profile.tsx:508:112 - error TS7006: Parameter 'i' implicitly has an 'any' type.

508                         {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].bulletPoints.map((point, i) => (
                                                                                                                   ~

components/profile/builder-profile.tsx:546:99 - error TS7006: Parameter 'point' implicitly has an 'any' type.

546                         {profile.expertiseAreas[SpecializationArea.AI_LITERACY].bulletPoints.map((point, i) => (
                                                                                                      ~~~~~

components/profile/builder-profile.tsx:546:106 - error TS7006: Parameter 'i' implicitly has an 'any' type.

546                         {profile.expertiseAreas[SpecializationArea.AI_LITERACY].bulletPoints.map((point, i) => (
                                                                                                             ~

components/profile/builder-profile.tsx:584:104 - error TS7006: Parameter 'point' implicitly has an 'any' type.

584                         {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].bulletPoints.map((point, i) => (
                                                                                                           ~~~~~

components/profile/builder-profile.tsx:584:111 - error TS7006: Parameter 'i' implicitly has an 'any' type.

584                         {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].bulletPoints.map((point, i) => (
                                                                                                                  ~

components/profile/builder-profile.tsx:622:102 - error TS7006: Parameter 'point' implicitly has an 'any' type.

622                         {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].bulletPoints.map((point, i) => (
                                                                                                         ~~~~~

components/profile/builder-profile.tsx:622:109 - error TS7006: Parameter 'i' implicitly has an 'any' type.

622                         {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].bulletPoints.map((point, i) => (
                                                                                                                ~

components/profile/client-profile.tsx:11:10 - error TS2305: Module '"@/components/scheduling"' has no exported member 'BookingHistoryList'.

11 import { BookingHistoryList } from "@/components/scheduling";
            ~~~~~~~~~~~~~~~~~~

components/profile/client-profile.tsx:70:11 - error TS2322: Type '{ src: any; alt: any; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.
  Property 'src' does not exist on type 'IntrinsicAttributes & Omit<AvatarProps & RefAttributes<HTMLSpanElement>, "ref"> & RefAttributes<HTMLSpanElement>'.

70           src={clientData.avatarUrl}
             ~~~

components/profile/client-profile.tsx:107:44 - error TS7006: Parameter 'interest' implicitly has an 'any' type.

107                 {clientData.interests.map((interest) => (
                                               ~~~~~~~~

components/profile/portfolio-gallery.tsx:77:21 - error TS7053: Element implicitly has an 'any' type because expression of type 'ValidationTier' can't be used to index type '{ entry: string; established: string; expert: string; }'.
  Property 'verified' does not exist on type '{ entry: string; established: string; expert: string; }'.

77   const tierColor = tierColorMap[validationTier];
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/profile/portfolio-gallery.tsx:381:15 - error TS2367: This comparison appears to be unintentional because the types 'ValidationTier' and '"entry"' have no overlap.

381               validationTier === "entry" && "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30",
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~

components/profile/portfolio-gallery.tsx:382:15 - error TS2367: This comparison appears to be unintentional because the types 'ValidationTier' and '"established"' have no overlap.

382               validationTier === "established" && "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30",
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/profile/profile-auth-provider.tsx:17:10 - error TS2724: '"@/lib/profile/types"' has no exported member named 'BuilderProfile'. Did you mean 'BuilderProfileData'?

17 import { BuilderProfile, ProfilePermissions } from "@/lib/profile/types";
            ~~~~~~~~~~~~~~

components/profile/role-badges.tsx:53:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'UserRole' can't be used to index type '{ CLIENT: { icon: Element; label: string; color: string; description: string; }; BUILDER: { icon: Element; label: string; color: string; description: string; }; ADMIN: { icon: Element; label: string; color: string; description: string; }; }'.
  Property 'SUBSCRIBER' does not exist on type '{ CLIENT: { icon: Element; label: string; color: string; description: string; }; BUILDER: { icon: Element; label: string; color: string; description: string; }; ADMIN: { icon: Element; label: string; color: string; description: string; }; }'.

53   const config = roleConfig[role];
                    ~~~~~~~~~~~~~~~~

components/profile/success-metrics-dashboard.tsx:132:21 - error TS7053: Element implicitly has an 'any' type because expression of type 'ValidationTier' can't be used to index type '{ entry: string; established: string; expert: string; }'.
  Property 'verified' does not exist on type '{ entry: string; established: string; expert: string; }'.

132   const tierColor = tierColorMap[validationTier];
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/providers/datadog-rum-provider.tsx:32:19 - error TS2339: Property 'user' does not exist on type 'UseAuthReturn'.

32   const { userId, user, isSignedIn } = useAuth();
                     ~~~~

components/providers/enhanced-clerk-provider.tsx:130:7 - error TS2322: Type '{ children: Element; appearance: { baseTheme: BaseThemeTaggedType | undefined; elements: { formButtonPrimary: string; card: string; formButtonReset: string; ... 8 more ...; dividerText: string; }; }; publishableKey: string | undefined; signInUrl: string; signUpUrl: string; telemetry: boolean; }' is not assignable to type 'IntrinsicAttributes & NextAppClerkProviderProps'.
  Property 'telemetry' does not exist on type 'IntrinsicAttributes & NextAppClerkProviderProps'.

130       telemetry={false}
          ~~~~~~~~~

components/providers/index.ts:7:10 - error TS2305: Module '"./providers"' has no exported member 'default'.

7 export { default as providers } from './providers';
           ~~~~~~~

components/providers/index.ts:8:10 - error TS2305: Module '"./clerk-provider"' has no exported member 'default'.

8 export { default as ClerkProvider } from './clerk-provider';
           ~~~~~~~

components/providers/index.ts:11:10 - error TS2305: Module '"./providers"' has no exported member 'default'.

11 export { default as Providers } from './providers';
            ~~~~~~~

components/scheduling/builder/availability/availability-management.tsx:6:10 - error TS2305: Module '"@/lib/scheduling/types"' has no exported member 'BuilderSchedulingProfile'.

6 import { BuilderSchedulingProfile } from '@/lib/scheduling/types';
           ~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/booking-confirmation.tsx:129:33 - error TS2345: Argument of type 'Date' is not assignable to parameter of type 'string'.

129                     {formatDate(new Date(booking.startTime))}
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-calendar.tsx:162:24 - error TS7006: Parameter 'date' implicitly has an 'any' type.

162             disabled={(date) => {
                           ~~~~

components/scheduling/calendly/calendly-embed-optimized.tsx:34:5 - error TS2687: All declarations of 'Calendly' must have identical modifiers.

34     Calendly: any;
       ~~~~~~~~

components/scheduling/calendly/calendly-embed-optimized.tsx:34:5 - error TS2717: Subsequent property declarations must have the same type.  Property 'Calendly' must be of type '{ initInlineWidget: (options: { url: string; parentElement: HTMLElement; prefill?: Record<string, string> | undefined; utm?: Record<string, string> | undefined; }) => void; } | undefined', but here has type 'any'.

34     Calendly: any;
       ~~~~~~~~

  components/scheduling/calendly/calendly-embed.tsx:278:5
    278     Calendly?: {
            ~~~~~~~~
    'Calendly' was also declared here.

components/scheduling/calendly/calendly-embed-optimized.tsx:102:11 - error TS2353: Object literal may only specify known properties, and 'embedType' does not exist in type '{ url: string; parentElement: HTMLElement; prefill?: Record<string, string> | undefined; utm?: Record<string, string> | undefined; }'.

102           embedType: 'Inline',
              ~~~~~~~~~

components/scheduling/calendly/calendly-embed.tsx:162:9 - error TS2353: Object literal may only specify known properties, and 'embedType' does not exist in type '{ url: string; parentElement: HTMLElement; prefill?: Record<string, string> | undefined; utm?: Record<string, string> | undefined; }'.

162         embedType: 'Inline',
            ~~~~~~~~~

components/scheduling/calendly/calendly-embed.tsx:219:32 - error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?

219         if (window.Calendly && window.Calendly.initInlineWidget) {
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-embed.tsx:278:5 - error TS2687: All declarations of 'Calendly' must have identical modifiers.

278     Calendly?: {
        ~~~~~~~~

components/scheduling/client/booking-calendar.tsx:341:26 - error TS2304: Cannot find name 'Calendar'.

341                         <Calendar
                             ~~~~~~~~

components/scheduling/client/booking-calendar.tsx:345:38 - error TS7006: Parameter 'date' implicitly has an 'any' type.

345                           disabled={(date) => {
                                         ~~~~

components/scheduling/client/booking-flow.tsx:270:7 - error TS2554: Expected 2-4 arguments, but got 5.

270       customQuestionResponse
          ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/client/booking-flow.tsx:432:35 - error TS2339: Property 'userName' does not exist on type 'ClientBookingState'.

432                       name: state.userName || (isSignedIn ? 'User' : 'Guest'),
                                      ~~~~~~~~

components/scheduling/client/booking-flow.tsx:433:36 - error TS2339: Property 'userEmail' does not exist on type 'ClientBookingState'.

433                       email: state.userEmail || (isSignedIn ? 'user@example.com' : 'guest@example.com'),
                                       ~~~~~~~~~

components/scheduling/client/booking-flow.tsx:478:30 - error TS2353: Object literal may only specify known properties, and 'error' does not exist in type '{ message: string; code?: string | undefined; }'.

478                   payload: { error: error instanceof Error ? error : new Error('Unknown error') }
                                 ~~~~~

components/scheduling/client/integrated-booking.tsx:9:10 - error TS2614: Module '"@/components/scheduling/calendly/calendly-embed"' has no exported member 'CalendlyEmbed'. Did you mean to use 'import CalendlyEmbed from "@/components/scheduling/calendly/calendly-embed"' instead?

9 import { CalendlyEmbed } from '@/components/scheduling/calendly/calendly-embed';
           ~~~~~~~~~~~~~

components/scheduling/client/stripe-booking-form.tsx:84:11 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<...> | (() => ReactNode)'.

84           title: 'Authentication Required',
             ~~~~~

components/scheduling/client/stripe-booking-form.tsx:99:9 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<...> | (() => ReactNode)'.

99         title: 'Error',
           ~~~~~

components/scheduling/index.ts:34:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/components/scheduling/ui/index.ts' is not a module.

34 export * from './ui';
                 ~~~~~~

components/scheduling/shared/timezone-selector.tsx:11:58 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/scheduling/utils.ts' is not a module.

11 import { getCommonTimezones, detectClientTimezone } from '@/lib/scheduling/utils';
                                                            ~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/shared/timezone-selector.tsx:49:27 - error TS7006: Parameter 'timezone' implicitly has an 'any' type.

49           {timezones.map((timezone) => (
                             ~~~~~~~~

components/ui/core/calendar.tsx:5:27 - error TS2307: Cannot find module 'react-day-picker' or its corresponding type declarations.

5 import { DayPicker } from 'react-day-picker';
                            ~~~~~~~~~~~~~~~~~~

components/user-auth-form.tsx:62:28 - error TS18048: 'signIn' is possibly 'undefined'.

62       const result = await signIn.create({
                              ~~~~~~

components/user-auth-form.tsx:65:9 - error TS2353: Object literal may only specify known properties, and 'redirectUrl' does not exist in type '{ strategy: "phone_code" | "email_code" | "web3_metamask_signature" | "reset_password_email_code" | "reset_password_phone_code"; identifier: string; } & { transfer?: boolean | undefined; }'.

65         redirectUrl: callbackUrl
           ~~~~~~~~~~~

components/user-auth-form.tsx:92:13 - error TS18048: 'signIn' is possibly 'undefined'.

92       await signIn.authenticateWithRedirect({
               ~~~~~~

hooks/index.ts:7:15 - error TS2307: Cannot find module './auth' or its corresponding type declarations.

7 export * from './auth';
                ~~~~~~~~

hooks/index.ts:8:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/marketplace/index.ts' is not a module.

8 export * from './marketplace';
                ~~~~~~~~~~~~~~~

hooks/index.ts:10:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/payment/index.ts' is not a module.

10 export * from './payment';
                 ~~~~~~~~~~~

hooks/index.ts:11:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/profile/index.ts' is not a module.

11 export * from './profile';
                 ~~~~~~~~~~~

hooks/index.ts:12:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/admin/index.ts' is not a module.

12 export * from './admin';
                 ~~~~~~~~~

hooks/index.ts:13:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/trust/index.ts' is not a module.

13 export * from './trust';
                 ~~~~~~~~~

hooks/index.ts:14:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/hooks/community/index.ts' is not a module.

14 export * from './community';
                 ~~~~~~~~~~~~~

instrumentation-client.ts:52:30 - error TS2339: Property 'BrowserTracing' does not exist on type '{ default: typeof import("/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"); ... 226 more ...; winterCGFetchIntegration: (op...'.

52       if (SentryIntegrations.BrowserTracing) {
                                ~~~~~~~~~~~~~~

instrumentation-client.ts:53:54 - error TS2339: Property 'BrowserTracing' does not exist on type '{ default: typeof import("/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"); ... 226 more ...; winterCGFetchIntegration: (op...'.

53         Sentry.addIntegration(new SentryIntegrations.BrowserTracing());
                                                        ~~~~~~~~~~~~~~

instrumentation-client.ts:79:47 - error TS7006: Parameter 'context' implicitly has an 'any' type.

79 export const onRouterTransitionStart = async (context) => {
                                                 ~~~~~~~

instrumentation-client.ts:88:12 - error TS2339: Property 'startTransaction' does not exist on type '{ default: typeof import("/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"); ... 226 more ...; winterCGFetchIntegration: (op...'.

88     Sentry.startTransaction({
              ~~~~~~~~~~~~~~~~

instrumentation-client.ts:103:50 - error TS7006: Parameter 'context' implicitly has an 'any' type.

103 export const onRouterTransitionComplete = async (context) => {
                                                     ~~~~~~~

instrumentation-client.ts:112:38 - error TS2339: Property 'getCurrentHub' does not exist on type '{ default: typeof import("/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"); ... 226 more ...; winterCGFetchIntegration: (op...'.

112     const activeTransaction = Sentry.getCurrentHub().getScope()?.getTransaction();
                                         ~~~~~~~~~~~~~

instrumentation.ts:35:38 - error TS7006: Parameter 'error' implicitly has an 'any' type.

35 export const onRequestError = async (error) => {
                                        ~~~~~

lib/admin/api.ts:21:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

21           type: AdminErrorType.RETRIEVAL,
                                  ~~~~~~~~~

lib/admin/api.ts:34:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

34           type: AdminErrorType.RETRIEVAL,
                                  ~~~~~~~~~

lib/admin/api.ts:51:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

51         type: AdminErrorType.NETWORK,
                                ~~~~~~~

lib/admin/api.ts:72:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

72           type: AdminErrorType.RETRIEVAL,
                                  ~~~~~~~~~

lib/admin/api.ts:85:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

85           type: AdminErrorType.RETRIEVAL,
                                  ~~~~~~~~~

lib/admin/api.ts:102:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

102         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/api.ts:132:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

132           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:145:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

145           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:162:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

162         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/api.ts:196:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

196           type: AdminErrorType.RETRIEVAL,
                                   ~~~~~~~~~

lib/admin/api.ts:209:32 - error TS2339: Property 'RETRIEVAL' does not exist on type 'typeof AdminErrorType'.

209           type: AdminErrorType.RETRIEVAL,
                                   ~~~~~~~~~

lib/admin/api.ts:226:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

226         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/api.ts:258:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

258           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:271:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

271           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:288:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

288         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/api.ts:326:32 - error TS2339: Property 'OPERATION' does not exist on type 'typeof AdminErrorType'.

326           type: AdminErrorType.OPERATION,
                                   ~~~~~~~~~

lib/admin/api.ts:339:32 - error TS2339: Property 'OPERATION' does not exist on type 'typeof AdminErrorType'.

339           type: AdminErrorType.OPERATION,
                                   ~~~~~~~~~

lib/admin/api.ts:356:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

356         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/api.ts:393:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

393           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:406:32 - error TS2339: Property 'UPDATE' does not exist on type 'typeof AdminErrorType'.

406           type: AdminErrorType.UPDATE,
                                   ~~~~~~

lib/admin/api.ts:423:30 - error TS2339: Property 'NETWORK' does not exist on type 'typeof AdminErrorType'.

423         type: AdminErrorType.NETWORK,
                                 ~~~~~~~

lib/admin/index.ts:9:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/admin/actions.ts' is not a module.

9 export * from "./actions";
                ~~~~~~~~~~~

lib/auth/api-protection.ts:53:52 - error TS2339: Property 'roles' does not exist on type '{}'.

53   return (authResult.sessionClaims.publicMetadata?.roles as UserRole[]) || [];
                                                      ~~~~~

lib/auth/api-protection.ts:83:27 - error TS2339: Property 'status' does not exist on type 'AuthenticationError'.

83           { status: error.status }
                             ~~~~~~

lib/auth/api-protection.ts:207:25 - error TS2339: Property 'status' does not exist on type 'AuthorizationError'.

207         { status: error.status }
                            ~~~~~~

lib/auth/api-protection.ts:244:25 - error TS2339: Property 'status' does not exist on type 'AuthorizationError'.

244         { status: error.status }
                            ~~~~~~

lib/auth/api-protection.ts:281:25 - error TS2339: Property 'status' does not exist on type 'AuthorizationError'.

281         { status: error.status }
                            ~~~~~~

lib/auth/api-protection.ts:333:59 - error TS2339: Property 'permissions' does not exist on type '{}'.

333     const userPermissions = (auth.claims?.publicMetadata?.permissions as string[]) || [];
                                                              ~~~~~~~~~~~

lib/auth/api-protection.ts:353:25 - error TS2339: Property 'status' does not exist on type 'AuthorizationError'.

353         { status: error.status }
                            ~~~~~~

lib/auth/data-access.ts:53:9 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.

53         image: data.image,
           ~~~~~

  node_modules/.prisma/client/index.d.ts:4233:5
    4233     data: XOR<UserCreateInput, UserUncheckedCreateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput); }'

lib/auth/security-logging.ts:35:28 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

35     const ip = headersList.get('x-forwarded-for') ||
                              ~~~

  lib/auth/security-logging.ts:35:28
    35     const ip = headersList.get('x-forwarded-for') ||
                                  ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:36:28 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

36                headersList.get('x-real-ip') ||
                              ~~~

  lib/auth/security-logging.ts:36:28
    36                headersList.get('x-real-ip') ||
                                  ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:38:35 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

38     const userAgent = headersList.get('user-agent') || 'unknown';
                                     ~~~

  lib/auth/security-logging.ts:38:35
    38     const userAgent = headersList.get('user-agent') || 'unknown';
                                         ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:78:16 - error TS2339: Property 'auditLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

78       await db.auditLog.create({
                  ~~~~~~~~

lib/auth/security-logging.ts:125:28 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

125     const ip = headersList.get('x-forwarded-for') ||
                               ~~~

  lib/auth/security-logging.ts:125:28
    125     const ip = headersList.get('x-forwarded-for') ||
                                   ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:126:28 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

126                headersList.get('x-real-ip') ||
                               ~~~

  lib/auth/security-logging.ts:126:28
    126                headersList.get('x-real-ip') ||
                                   ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:160:16 - error TS2339: Property 'auditLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

160       await db.auditLog.create({
                   ~~~~~~~~

lib/auth/security-logging.ts:168:34 - error TS2339: Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'.

168           userAgent: headersList.get('user-agent') || undefined
                                     ~~~

  lib/auth/security-logging.ts:168:34
    168           userAgent: headersList.get('user-agent') || undefined
                                         ~~~
    Did you forget to use 'await'?

lib/auth/security-logging.ts:174:14 - error TS2339: Property 'webhookEvent' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

174     await db.webhookEvent.upsert({
                 ~~~~~~~~~~~~

lib/auth/security-logging.ts:196:14 - error TS2339: Property 'webhookMetric' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

196     await db.webhookMetric.create({
                 ~~~~~~~~~~~~~

lib/community/index.ts:11:1 - error TS2308: Module "./actions" has already exported a member named 'addComment'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from "./api";
   ~~~~~~~~~~~~~~~~~~~~~~

lib/community/index.ts:11:1 - error TS2308: Module "./actions" has already exported a member named 'createDiscussion'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from "./api";
   ~~~~~~~~~~~~~~~~~~~~~~

lib/community/index.ts:11:1 - error TS2308: Module "./actions" has already exported a member named 'getRecentDiscussions'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from "./api";
   ~~~~~~~~~~~~~~~~~~~~~~

lib/community/index.ts:11:1 - error TS2308: Module "./actions" has already exported a member named 'rateContribution'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from "./api";
   ~~~~~~~~~~~~~~~~~~~~~~

lib/contexts/profile-context.tsx:44:62 - error TS2345: Argument of type '{ id: string; name: string; title: string; bio: string; avatarUrl: string; validationTier: "verified"; joinDate: Date; completedProjects: number; rating: number; responseRate: number; skills: string[]; ... 5 more ...; expertiseAreas: { ...; }; }' is not assignable to parameter of type 'BuilderProfileData | (() => BuilderProfileData)'.
  Type '{ id: string; name: string; title: string; bio: string; avatarUrl: string; validationTier: "verified"; joinDate: Date; completedProjects: number; rating: number; responseRate: number; skills: string[]; ... 5 more ...; expertiseAreas: { ...; }; }' is not assignable to type 'BuilderProfileData'.
    Types of property 'roles' are incompatible.
      Type 'string[]' is not assignable to type 'UserRole[]'.
        Type 'string' is not assignable to type 'UserRole'.

44   const [profile, setProfile] = useState<BuilderProfileData>(mockEstablishedTierProfile);
                                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/auth-monitoring.ts:126:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

126     finishAuthSpan(spanId, true);
                       ~~~~~~

lib/datadog/auth-monitoring.ts:144:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

144     finishAuthSpan(spanId, false, errorMessage);
                       ~~~~~~

lib/datadog/auth-monitoring.ts:204:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

204     finishAuthSpan(spanId, hasRequiredRole);
                       ~~~~~~

lib/datadog/auth-monitoring.ts:223:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

223     finishAuthSpan(spanId, false, errorMessage);
                       ~~~~~~

lib/datadog/auth-monitoring.ts:278:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

278     finishAuthSpan(spanId, hasPermission);
                       ~~~~~~

lib/datadog/auth-monitoring.ts:296:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

296     finishAuthSpan(spanId, false, errorMessage);
                       ~~~~~~

lib/datadog/client.ts:15:1 - error TS2308: Module './interfaces' has already exported a member named 'RumConfig'. Consider explicitly re-exporting to resolve the ambiguity.

15 export * from './rum-config';
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/client.ts:15:1 - error TS2308: Module './interfaces' has already exported a member named 'RumUserInfo'. Consider explicitly re-exporting to resolve the ambiguity.

15 export * from './rum-config';
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/client/empty-tracer.client.ts:99:5 - error TS1117: An object literal cannot have multiple properties with the same name.

99     activate: (span: any, fn: any) => fn()
       ~~~~~~~~

lib/datadog/sentry-integration.ts:17:5 - error TS7034: Variable 'tracer' implicitly has type 'any' in some locations where its type cannot be determined.

17 let tracer = null;
       ~~~~~~

lib/datadog/sentry-integration.ts:43:21 - error TS7005: Variable 'tracer' implicitly has an 'any' type.

43   if (!isServer || !tracer) return null;
                       ~~~~~~

lib/datadog/sentry-integration.ts:77:57 - error TS2724: '"/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"' has no exported member named 'Integration'. Did you mean 'fsIntegration'?

77 export class DatadogSentryIntegration implements Sentry.Integration {
                                                           ~~~~~~~~~~~

lib/datadog/sentry-integration.ts:86:48 - error TS2724: '"/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/@sentry+nextjs@9.14.0_@opentelemetry+context-async-hooks@1.30.1_@opentelemetry+api@1.9._18ea08ac16d476d9805e801211987b15/node_modules/@sentry/nextjs/build/types/index.types"' has no exported member named 'EventProcessor'. Did you mean 'addEventProcessor'?

86     addGlobalEventProcessor: (callback: Sentry.EventProcessor) => void,
                                                  ~~~~~~~~~~~~~~

lib/datadog/sentry-integration.ts:89:23 - error TS7005: Variable 'tracer' implicitly has an 'any' type.

89     if (!isServer || !tracer) return;
                         ~~~~~~

lib/datadog/server-actions.ts:27:14 - error TS2367: This comparison appears to be unintentional because the types '"development" | "test"' and '"staging"' have no overlap.

27              env === 'staging')
                ~~~~~~~~~~~~~~~~~

lib/datadog/server/tracer.server.ts:71:14 - error TS2339: Property 'configureTracerIntegrations' does not exist on type 'TracerInterface'.

71         this.configureTracerIntegrations(ddTrace);
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/server/tracer.server.ts:198:3 - error TS1042: 'private' modifier cannot be used here.

198   private configureTracerIntegrations(tracer: any): void {
      ~~~~~~~

lib/datadog/server/tracer.server.ts:198:3 - error TS1184: Modifiers cannot appear here.

198   private configureTracerIntegrations(tracer: any): void {
      ~~~~~~~

lib/datadog/server/tracer.server.ts:198:11 - error TS2353: Object literal may only specify known properties, and 'configureTracerIntegrations' does not exist in type 'TracerInterface'.

198   private configureTracerIntegrations(tracer: any): void {
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/tracer.ts:51:9 - error TS2322: Type '(message: string) => void' is not assignable to type '(err: string | Error) => void'.
  Types of parameters 'message' and 'err' are incompatible.
    Type 'string | Error' is not assignable to type 'string'.
      Type 'Error' is not assignable to type 'string'.

51         error: (message: string) => console.error(`[Datadog APM Error] ${message}`),
           ~~~~~

lib/datadog/tracer.ts:71:7 - error TS2559: Type 'true' has no properties in common with type '{ request?: ((span?: Span | undefined, req?: IncomingMessage | undefined, res?: ServerResponse<IncomingMessage> | undefined) => any) | undefined; }'.

71       hooks: true,
         ~~~~~

lib/datadog/tracer.ts:83:16 - error TS2345: Argument of type '"prisma"' is not assignable to parameter of type 'keyof Plugins'.

83     tracer.use('prisma', {
                  ~~~~~~~~

lib/datadog/tracer.ts:90:7 - error TS2559: Type 'true' has no properties in common with type '{ request?: ((span?: Span | undefined, req?: IncomingMessage | undefined, res?: ServerResponse<IncomingMessage> | undefined) => any) | undefined; }'.

90       hooks: true,
         ~~~~~

lib/datadog/tracer.ts:120:7 - error TS2322: Type 'Span | null' is not assignable to type 'Span | SpanContext | undefined'.
  Type 'null' is not assignable to type 'Span | SpanContext | undefined'.

120       childOf: tracer.scope().active(),
          ~~~~~~~

lib/db-error-handling.ts:91:34 - error TS2339: Property 'CRITICAL' does not exist on type 'typeof DatabaseErrorCategory'.

91     return DatabaseErrorCategory.CRITICAL;
                                    ~~~~~~~~

lib/db-error-handling.ts:164:5 - error TS2322: Type 'string[]' is not assignable to type 'string'.

164     target = error.meta?.target as string[] || undefined;
        ~~~~~~

lib/db-monitoring.ts:48:10 - error TS2345: Argument of type '"query"' is not assignable to parameter of type 'never'.

48   db.$on('query', (e) => {
            ~~~~~~~

lib/db-monitoring.ts:50:16 - error TS2339: Property 'query' does not exist on type 'never'.

50       query: e.query,
                  ~~~~~

lib/db-monitoring.ts:51:15 - error TS2339: Property 'duration' does not exist on type 'never'.

51       time: e.duration,
                 ~~~~~~~~

lib/db-monitoring.ts:61:11 - error TS2339: Property 'duration' does not exist on type 'never'.

61     if (e.duration > 500) {
             ~~~~~~~~

lib/db-monitoring.ts:63:18 - error TS2339: Property 'query' does not exist on type 'never'.

63         query: e.query,
                    ~~~~~

lib/db-monitoring.ts:64:19 - error TS2339: Property 'params' does not exist on type 'never'.

64         params: e.params,
                     ~~~~~~

lib/db-monitoring.ts:65:21 - error TS2339: Property 'duration' does not exist on type 'never'.

65         duration: e.duration,
                       ~~~~~~~~

lib/db-monitoring.ts:73:20 - error TS2339: Property 'query' does not exist on type 'never'.

73           query: e.query,
                      ~~~~~

lib/db-monitoring.ts:74:23 - error TS2339: Property 'duration' does not exist on type 'never'.

74           duration: e.duration,
                         ~~~~~~~~

lib/db.ts:40:62 - error TS2345: Argument of type '{ log: { emit: string; level: string; }[]; }' is not assignable to parameter of type 'Subset<PrismaClientOptions, PrismaClientOptions>'.
  Types of property 'log' are incompatible.
    Type '{ emit: string; level: string; }[]' is not assignable to type '(LogLevel | LogDefinition)[]'.
      Type '{ emit: string; level: string; }' is not assignable to type 'LogLevel | LogDefinition'.
        Type '{ emit: string; level: string; }' is not assignable to type 'LogDefinition'.
          Types of property 'level' are incompatible.
            Type 'string' is not assignable to type 'LogLevel'.

40 export const db = globalForPrisma.prisma || new PrismaClient(prismaOptions)
                                                                ~~~~~~~~~~~~~

lib/db.ts:44:10 - error TS2345: Argument of type '"query"' is not assignable to parameter of type 'never'.

44   db.$on('query', (e) => {
            ~~~~~~~

lib/db.ts:47:18 - error TS2339: Property 'query' does not exist on type 'never'.

47         query: e.query,
                    ~~~~~

lib/db.ts:48:19 - error TS2339: Property 'params' does not exist on type 'never'.

48         params: e.params,
                     ~~~~~~

lib/db.ts:49:21 - error TS2339: Property 'duration' does not exist on type 'never'.

49         duration: e.duration,
                       ~~~~~~~~

lib/db.ts:54:10 - error TS2345: Argument of type '"error"' is not assignable to parameter of type 'never'.

54   db.$on('error', (e) => {
            ~~~~~~~

lib/db.ts:56:18 - error TS2339: Property 'message' does not exist on type 'never'.

56       message: e.message,
                    ~~~~~~~

lib/db.ts:57:17 - error TS2339: Property 'target' does not exist on type 'never'.

57       target: e.target,
                   ~~~~~~

lib/db.ts:61:10 - error TS2345: Argument of type '"info"' is not assignable to parameter of type 'never'.

61   db.$on('info', (e) => {
            ~~~~~~

lib/db.ts:63:18 - error TS2339: Property 'message' does not exist on type 'never'.

63       message: e.message,
                    ~~~~~~~

lib/db.ts:64:17 - error TS2339: Property 'target' does not exist on type 'never'.

64       target: e.target,
                   ~~~~~~

lib/db.ts:68:10 - error TS2345: Argument of type '"warn"' is not assignable to parameter of type 'never'.

68   db.$on('warn', (e) => {
            ~~~~~~

lib/db.ts:70:18 - error TS2339: Property 'message' does not exist on type 'never'.

70       message: e.message,
                    ~~~~~~~

lib/db.ts:71:17 - error TS2339: Property 'target' does not exist on type 'never'.

71       target: e.target,
                   ~~~~~~

lib/enhanced-logger.client.ts:168:15 - error TS2322: Type 'string' is not assignable to type 'SeverityLevel | undefined'.

168               level: severityMap[level] || 'info'
                  ~~~~~

lib/enhanced-logger.server.ts:202:15 - error TS2322: Type 'string' is not assignable to type 'SeverityLevel | undefined'.

202               level: severityMap[level] || 'info'
                  ~~~~~

lib/marketplace/data/demo-account-handler.ts:39:9 - error TS2322: Type 'false' is not assignable to type 'undefined'.

39         isDemo: false
           ~~~~~~

lib/marketplace/data/demo-account-handler.ts:54:9 - error TS2322: Type 'false' is not assignable to type 'undefined'.

54         isDemo: false
           ~~~~~~

lib/marketplace/data/marketplace-service.ts:150:9 - error TS2559: Type '({ featured: string; } | { validationTier: string; } | { rating: string; })[]' has no properties in common with type 'BuilderProfileOrderByWithRelationInput'.

150         orderBy = [
            ~~~~~~~

lib/marketplace/data/marketplace-service.ts:183:9 - error TS7034: Variable 'builders' implicitly has type 'any[]' in some locations where its type cannot be determined.

183     let builders = [];
            ~~~~~~~~

lib/marketplace/data/marketplace-service.ts:253:54 - error TS7005: Variable 'builders' implicitly has an 'any[]' type.

253     const builderListings: BuilderProfileListing[] = builders.map((builder) => {
                                                         ~~~~~~~~

lib/marketplace/data/marketplace-service.ts:277:37 - error TS7006: Parameter 's' implicitly has an 'any' type.

277         skills: builder.skills.map((s) => s.skill.name),
                                        ~

lib/middleware/config.ts:212:7 - error TS2739: Type '{ enabled: false; }' is missing the following properties from type 'RateLimitConfig': defaultLimit, windowSize, typeConfig

212       rateLimit: {
          ~~~~~~~~~

lib/middleware/config.ts:220:5 - error TS2739: Type '{ securityHeaders: { strictTransportSecurity: string; }; }' is missing the following properties from type 'ApiProtectionConfig': csrf, rateLimit

220     api: {
        ~~~

  lib/middleware/config.ts:66:3
    66   api: ApiProtectionConfig;
         ~~~
    The expected type comes from property 'api' which is declared here on type 'Partial<MiddlewareConfig>'

lib/middleware/config.ts:230:7 - error TS2739: Type '{ enabled: false; }' is missing the following properties from type 'RateLimitConfig': defaultLimit, windowSize, typeConfig

230       rateLimit: {
          ~~~~~~~~~

lib/middleware/factory.ts:172:29 - error TS2345: Argument of type 'NextMiddleware' is not assignable to parameter of type '(req: NextRequest) => NextResponse<unknown> | Promise<NextResponse<unknown>>'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.

172   return withRequestLogging(middlewareFn);
                                ~~~~~~~~~~~~

lib/middleware/profile-auth.ts:92:18 - error TS2322: Type 'string | null' is not assignable to type 'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.

92         where: { clerkId },
                    ~~~~~~~

  node_modules/.prisma/client/index.d.ts:29834:5
    29834     clerkId?: string
              ~~~~~~~
    The expected type comes from property 'clerkId' which is declared here on type 'UserWhereUniqueInput'

lib/middleware/profile-auth.ts:153:39 - error TS2339: Property 'builderProfile' does not exist on type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

153           const builderProfile = user.builderProfile;
                                          ~~~~~~~~~~~~~~

lib/middleware/profile-auth.ts:181:38 - error TS2339: Property 'clientProfile' does not exist on type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

181           const clientProfile = user.clientProfile;
                                         ~~~~~~~~~~~~~

lib/middleware/profile-auth.ts:213:11 - error TS2322: Type '"client" | "builder" | "unknown"' is not assignable to type '"client" | "builder"'.
  Type '"unknown"' is not assignable to type '"client" | "builder"'.

213           profileType: profileType || 'unknown',
              ~~~~~~~~~~~

  lib/auth/security-logging.ts:303:3
    303   profileType: 'builder' | 'client';
          ~~~~~~~~~~~
    The expected type comes from property 'profileType' which is declared here on type '{ userId: string; profileId: string; profileType: "client" | "builder"; accessType: "view" | "delete" | "edit"; allowed: boolean; }'

lib/middleware/profile-auth.ts:223:9 - error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.

223         clerkId,
            ~~~~~~~

  lib/middleware/profile-auth.ts:18:3
    18   clerkId: string;
         ~~~~~~~
    The expected type comes from property 'clerkId' which is declared here on type 'ProfileRouteContext'

lib/middleware/test-utils.ts:22:11 - error TS2707: Generic type 'MockInstance<T>' requires between 0 and 1 type arguments.

22   mockFn: MockInstance<Args, Return>,
             ~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/payment/actions.ts:5:10 - error TS2305: Module '"@/lib/stripe"' has no exported member 'stripe'.

5 import { stripe } from "@/lib/stripe";
           ~~~~~~

lib/payment/actions.ts:6:10 - error TS2305: Module '"@/lib/stripe/types"' has no exported member 'StripeOperationResult'.

6 import { StripeOperationResult } from "@/lib/stripe/types";
           ~~~~~~~~~~~~~~~~~~~~~

lib/payment/actions.ts:18:26 - error TS2503: Cannot find namespace 'Stripe'.

18 ): Promise<PaymentResult<Stripe.Checkout.Session>> {
                            ~~~~~~

lib/payment/actions.ts:110:21 - error TS2503: Cannot find namespace 'Stripe'.

110     } as unknown as Stripe.Checkout.Session;
                        ~~~~~~

lib/payment/actions.ts:138:26 - error TS2503: Cannot find namespace 'Stripe'.

138 ): Promise<PaymentResult<Stripe.Checkout.Session>> {
                             ~~~~~~

lib/payment/actions.ts:193:21 - error TS2503: Cannot find namespace 'Stripe'.

193     } as unknown as Stripe.Checkout.Session;
                        ~~~~~~

lib/payment/actions.ts:295:26 - error TS2503: Cannot find namespace 'Stripe'.

295 ): Promise<PaymentResult<Stripe.Refund>> {
                             ~~~~~~

lib/payment/actions.ts:374:21 - error TS2503: Cannot find namespace 'Stripe'.

374     } as unknown as Stripe.Refund;
                        ~~~~~~

lib/payment/api.ts:302:7 - error TS2322: Type 'PaymentClientResult<{ sessionId: string; url: string; }>' is not assignable to type 'PaymentClientResult<{ redirectUrl: string; }>'.
  Property 'redirectUrl' is missing in type '{ sessionId: string; url: string; }' but required in type '{ redirectUrl: string; }'.

302       return checkoutResult;
          ~~~~~~

  lib/payment/api.ts:255:34
    255 ): Promise<PaymentClientResult<{ redirectUrl: string }>> {
                                         ~~~~~~~~~~~
    'redirectUrl' is declared here.

lib/payment/api.ts:309:22 - error TS18048: 'checkoutResult.data' is possibly 'undefined'.

309         redirectUrl: checkoutResult.data.url,
                         ~~~~~~~~~~~~~~~~~~~

lib/profile/actions.ts:196:9 - error TS2322: Type 'JsonValue' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue | undefined'.
  Type 'null' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue | undefined'.

196         socialLinks: data.socialLinks !== undefined ? data.socialLinks : user.builderProfile.socialLinks,
            ~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:32203:5
    32203     socialLinks?: NullableJsonNullValueInput | InputJsonValue
              ~~~~~~~~~~~
    The expected type comes from property 'socialLinks' which is declared here on type '(Without<BuilderProfileUpdateInput, BuilderProfileUncheckedUpdateInput> & BuilderProfileUncheckedUpdateInput) | (Without<...> & BuilderProfileUpdateInput)'

lib/profile/actions.ts:197:9 - error TS2322: Type 'any[] | null' is not assignable to type 'InputJsonValue[] | BuilderProfileUpdateportfolioItemsInput | undefined'.
  Type 'null' is not assignable to type 'InputJsonValue[] | BuilderProfileUpdateportfolioItemsInput | undefined'.

197         portfolioItems: data.portfolioItems !== undefined ? data.portfolioItems : user.builderProfile.portfolioItems,
            ~~~~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:32197:5
    32197     portfolioItems?: BuilderProfileUpdateportfolioItemsInput | InputJsonValue[]
              ~~~~~~~~~~~~~~
    The expected type comes from property 'portfolioItems' which is declared here on type '(Without<BuilderProfileUpdateInput, BuilderProfileUncheckedUpdateInput> & BuilderProfileUncheckedUpdateInput) | (Without<...> & BuilderProfileUpdateInput)'

lib/profile/actions.ts:551:9 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.

551         title: title || null,
            ~~~~~

  node_modules/.prisma/client/index.d.ts:4285:5
    4285     data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput); where: UserWhereUniqueInput; }'

lib/profile/actions.ts:600:19 - error TS2339: Property 'title' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

600       title: user.title,
                      ~~~~~

lib/profile/actions.ts:601:17 - error TS2339: Property 'bio' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

601       bio: user.bio,
                    ~~~

lib/profile/actions.ts:602:22 - error TS2339: Property 'location' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

602       location: user.location,
                         ~~~~~~~~

lib/profile/actions.ts:603:21 - error TS2339: Property 'website' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

603       website: user.website,
                        ~~~~~~~

lib/profile/actions.ts:664:19 - error TS2339: Property 'title' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

664       title: user.title,
                      ~~~~~

lib/profile/actions.ts:665:17 - error TS2339: Property 'bio' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

665       bio: user.bio,
                    ~~~

lib/profile/actions.ts:666:22 - error TS2339: Property 'location' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

666       location: user.location,
                         ~~~~~~~~

lib/profile/actions.ts:667:21 - error TS2339: Property 'website' does not exist on type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

667       website: user.website,
                        ~~~~~~~

lib/profile/actions.ts:745:28 - error TS2339: Property 'interests' does not exist on type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

745     const interests = user.interests || []
                               ~~~~~~~~~

lib/profile/api.ts:9:3 - error TS2724: '"./types"' has no exported member named 'BuilderProfile'. Did you mean 'BuilderProfileData'?

9   BuilderProfile,
    ~~~~~~~~~~~~~~

lib/profile/api.ts:11:3 - error TS2724: '"./types"' has no exported member named 'BuilderProfilesResponse'. Did you mean 'BuilderProfileResponse'?

11   BuilderProfilesResponse,
     ~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/api.ts:12:3 - error TS2305: Module '"./types"' has no exported member 'CreateProfileRequest'.

12   CreateProfileRequest,
     ~~~~~~~~~~~~~~~~~~~~

lib/profile/api.ts:13:3 - error TS2305: Module '"./types"' has no exported member 'UpdateProfileRequest'.

13   UpdateProfileRequest
     ~~~~~~~~~~~~~~~~~~~~

lib/profile/api.ts:30:16 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

30       return { success: false, error: error.message || 'Failed to fetch profile' };
                  ~~~~~~~

lib/profile/api.ts:34:14 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

34     return { success: true, data };
                ~~~~~~~

lib/profile/api.ts:37:7 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

37       success: false,
         ~~~~~~~

lib/profile/api.ts:57:16 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

57       return { success: false, error: error.message || 'Failed to fetch profile' };
                  ~~~~~~~

lib/profile/api.ts:61:14 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

61     return { success: true, data };
                ~~~~~~~

lib/profile/api.ts:64:7 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

64       success: false,
         ~~~~~~~

lib/profile/api.ts:84:16 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

84       return { success: false, error: error.message || 'Failed to fetch profile' };
                  ~~~~~~~

lib/profile/api.ts:88:14 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

88     return { success: true, data };
                ~~~~~~~

lib/profile/api.ts:91:7 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

91       success: false,
         ~~~~~~~

lib/profile/api.ts:162:16 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

162       return { success: false, error: error.message || 'Failed to create profile' };
                   ~~~~~~~

lib/profile/api.ts:166:14 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

166     return { success: true, data };
                 ~~~~~~~

lib/profile/api.ts:169:7 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

169       success: false,
          ~~~~~~~

lib/profile/api.ts:193:16 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

193       return { success: false, error: error.message || 'Failed to update profile' };
                   ~~~~~~~

lib/profile/api.ts:197:14 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

197     return { success: true, data };
                 ~~~~~~~

lib/profile/api.ts:200:7 - error TS2353: Object literal may only specify known properties, and 'success' does not exist in type 'BuilderProfileResponse'.

200       success: false,
          ~~~~~~~

lib/profile/data-service.ts:102:5 - error TS2322: Type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }' is not assignable to type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; clientProfile: { ...; } | null; } & { ...; }'.
  Type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }' is missing the following properties from type '{ builderProfile: { userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; clientProfile: { ...; } | null; }': builderProfile, clientProfile

102     user = await db.user.create({
        ~~~~

lib/profile/data-service.ts:107:9 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.

107         image: userData.image_url,
            ~~~~~

  node_modules/.prisma/client/index.d.ts:4233:5
    4233     data: XOR<UserCreateInput, UserUncheckedCreateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput); }'

lib/profile/data-service.ts:119:63 - error TS18047: 'user' is possibly 'null'.

119     logger.info('Created new user from Clerk data', { userId: user.id, clerkId });
                                                                  ~~~~

lib/profile/data-service.ts:122:33 - error TS18047: 'user' is possibly 'null'.

122     await ensureProfilesForUser(user.id, roles);
                                    ~~~~

lib/profile/data-service.ts:126:15 - error TS18047: 'user' is possibly 'null'.

126       userId: user.id,
                  ~~~~

lib/profile/data-service.ts:128:17 - error TS18047: 'user' is possibly 'null'.

128       targetId: user.id,
                    ~~~~

lib/profile/data-service.ts:353:9 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.

353         image: userData.image_url || user.image,
            ~~~~~

  node_modules/.prisma/client/index.d.ts:4285:5
    4285     data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
             ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: UserSelect<DefaultArgs> | null | undefined; omit?: UserOmit<DefaultArgs> | null | undefined; include?: UserInclude<DefaultArgs> | null | undefined; data: (Without<...> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput); where: UserWhereUniqueInput; }'

lib/profile/data-service.ts:353:43 - error TS2339: Property 'image' does not exist on type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

353         image: userData.image_url || user.image,
                                              ~~~~~

lib/profile/data-service.ts:371:43 - error TS2339: Property 'image' does not exist on type '{ name: string | null; id: string; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

371           ...(userData.image_url !== user.image ? ['image'] : []),
                                              ~~~~~

lib/profile/data-service.ts:411:21 - error TS2339: Property 'auditLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

411     return await db.auditLog.create({
                        ~~~~~~~~

lib/profile/index.ts:8:1 - error TS2308: Module './actions' has already exported a member named 'getBuilderProfileBySlug'. Consider explicitly re-exporting to resolve the ambiguity.

8 export * from './api';
  ~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:8:1 - error TS2308: Module './actions' has already exported a member named 'updateBuilderProfile'. Consider explicitly re-exporting to resolve the ambiguity.

8 export * from './api';
  ~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'AIApp'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'Metric'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'MetricsCategory'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'PortfolioProject'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'ProfileImage'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'SocialProfiles'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'SpecializationContent'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'Testimonial'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:11:1 - error TS2308: Module './schemas' has already exported a member named 'UpdateBuilderProfileData'. Consider explicitly re-exporting to resolve the ambiguity.

11 export * from './types';
   ~~~~~~~~~~~~~~~~~~~~~~~~

lib/profile/index.ts:12:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/profile/utils.ts' is not a module.

12 export * from './utils';
                 ~~~~~~~~~

lib/profile/schemas.ts:93:3 - error TS2339: Property 'partial' does not exist on type 'ZodRecord<ZodNativeEnum<typeof SpecializationArea>, ZodObject<{ description: ZodString; bulletPoints: ZodArray<ZodString, "many">; testimonials: ZodArray<...>; }, "strip", ZodTypeAny, { ...; }, { ...; }>>'.

93 ).partial();
     ~~~~~~~

lib/scheduling/actions.ts:281:11 - error TS2322: Type '{ createdAt: string; updatedAt: string; builderId: string; startTime: string; endTime: string; isRecurring: boolean; dayOfWeek: number; id: string; }' is not assignable to type 'AvailabilityRule'.
  Types of property 'dayOfWeek' are incompatible.
    Type 'number' is not assignable to type 'DayOfWeek'.

281     const mockRule: AvailabilityRule = {
              ~~~~~~~~

lib/scheduling/calendly/api-client.ts:71:11 - error TS2395: Individual declarations in merged declaration 'CalendlyEventTypesResponse' must be all exported or all local.

71 interface CalendlyEventTypesResponse {
             ~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:82:11 - error TS2395: Individual declarations in merged declaration 'CalendlyEventTypeResponse' must be all exported or all local.

82 interface CalendlyEventTypeResponse {
             ~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:89:11 - error TS2395: Individual declarations in merged declaration 'CalendlyUserResponse' must be all exported or all local.

89 interface CalendlyUserResponse {
             ~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:99:11 - error TS2395: Individual declarations in merged declaration 'CalendlyOrganizationResponse' must be all exported or all local.

99 interface CalendlyOrganizationResponse {
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:625:18 - error TS2395: Individual declarations in merged declaration 'CalendlyUserResponse' must be all exported or all local.

625 export interface CalendlyUserResponse {
                     ~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:640:18 - error TS2395: Individual declarations in merged declaration 'CalendlyOrganizationResponse' must be all exported or all local.

640 export interface CalendlyOrganizationResponse {
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:648:18 - error TS2395: Individual declarations in merged declaration 'CalendlyEventTypesResponse' must be all exported or all local.

648 export interface CalendlyEventTypesResponse {
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/api-client.ts:653:18 - error TS2395: Individual declarations in merged declaration 'CalendlyEventTypeResponse' must be all exported or all local.

653 export interface CalendlyEventTypeResponse {
                     ~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/conflict-handler.ts:52:48 - error TS2322: Type '"IN_PROGRESS"' is not assignable to type 'BookingStatus'.

52         status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
                                                  ~~~~~~~~~~~~~

lib/scheduling/calendly/conflict-handler.ts:237:50 - error TS2322: Type '"IN_PROGRESS"' is not assignable to type 'BookingStatus'.

237           status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
                                                     ~~~~~~~~~~~~~

lib/scheduling/calendly/conflict-handler.ts:434:39 - error TS2339: Property 'name' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

434         builderName: booking.builder?.name,
                                          ~~~~

lib/scheduling/calendly/refund-service.ts:72:31 - error TS2339: Property 'toNumber' does not exist on type 'number'.

72       amount: booking.amount?.toNumber(),
                                 ~~~~~~~~

lib/scheduling/calendly/refund-service.ts:79:47 - error TS2339: Property 'toNumber' does not exist on type 'number'.

79       amount: booking.amount ? booking.amount.toNumber() * 0.5 : undefined,
                                                 ~~~~~~~~

lib/scheduling/calendly/refund-service.ts:130:54 - error TS2345: Argument of type '{ clientId: string | null; builderId: string; sessionTypeId: string | null; clientTimezone: string | null; status: BookingStatus; id: string; createdAt: Date; updatedAt: Date; ... 15 more ...; lastTransition: Date | null; }' is not assignable to parameter of type '{ id: string; startTime: Date; paymentStatus?: string | undefined; stripeSessionId?: string | null | undefined; amount?: number | null | undefined; }'.
  Types of property 'amount' are incompatible.
    Type 'Decimal | null' is not assignable to type 'number | null | undefined'.
      Type 'Decimal' is not assignable to type 'number'.

130     const refundPolicy = await calculateRefundPolicy(booking)
                                                         ~~~~~~~

lib/scheduling/calendly/refund-service.ts:137:11 - error TS2353: Object literal may only specify known properties, and 'cancellationReason' does not exist in type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'.

137           cancellationReason: reason,
              ~~~~~~~~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:19715:5
    19715     data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: BookingSelect<DefaultArgs> | null | undefined; omit?: BookingOmit<DefaultArgs> | null | undefined; include?: BookingInclude<...> | ... 1 more ... | undefined; data: (Without<...> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput); where: BookingWhereUniqueInput; }'

lib/scheduling/calendly/refund-service.ts:182:11 - error TS2353: Object literal may only specify known properties, and 'cancellationReason' does not exist in type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'.

182           cancellationReason: reason,
              ~~~~~~~~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:19715:5
    19715     data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: BookingSelect<DefaultArgs> | null | undefined; omit?: BookingOmit<DefaultArgs> | null | undefined; include?: BookingInclude<...> | ... 1 more ... | undefined; data: (Without<...> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput); where: BookingWhereUniqueInput; }'

lib/scheduling/calendly/refund-service.ts:215:27 - error TS2339: Property 'currency' does not exist on type '{ clientId: string | null; builderId: string; sessionTypeId: string | null; clientTimezone: string | null; status: BookingStatus; id: string; createdAt: Date; updatedAt: Date; ... 15 more ...; lastTransition: Date | null; }'.

215         currency: booking.currency || 'USD',
                              ~~~~~~~~

lib/scheduling/calendly/refund-service.ts:293:54 - error TS2345: Argument of type '{ clientId: string | null; builderId: string; sessionTypeId: string | null; clientTimezone: string | null; status: BookingStatus; id: string; createdAt: Date; updatedAt: Date; ... 15 more ...; lastTransition: Date | null; }' is not assignable to parameter of type '{ id: string; startTime: Date; paymentStatus?: string | undefined; stripeSessionId?: string | null | undefined; amount?: number | null | undefined; }'.
  Types of property 'amount' are incompatible.
    Type 'Decimal | null' is not assignable to type 'number | null | undefined'.
      Type 'Decimal' is not assignable to type 'number'.

293     const refundPolicy = await calculateRefundPolicy(booking)
                                                         ~~~~~~~

lib/scheduling/calendly/service.ts:295:45 - error TS2339: Property 'timezone' does not exist on type '{ userId: string; id: string; createdAt: Date; updatedAt: Date; availability: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 18 more ...; schedulingSettings: JsonValue; }'.

295       builderTimezone: sessionType.builder?.timezone || undefined
                                                ~~~~~~~~

lib/scheduling/calendly/service.ts:332:7 - error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.

332       clientId: booking.clientId,
          ~~~~~~~~

lib/scheduling/calendly/service.ts:342:7 - error TS2322: Type 'PaymentStatus' is not assignable to type '"UNPAID" | "PAID" | "REFUNDED" | "FAILED"'.
  Type '"CANCELLED"' is not assignable to type '"UNPAID" | "PAID" | "REFUNDED" | "FAILED"'.

342       paymentStatus: booking.paymentStatus,
          ~~~~~~~~~~~~~

lib/scheduling/index.ts:8:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/scheduling/api.ts' is not a module.

8 export * from './api';
                ~~~~~~~

lib/scheduling/index.ts:11:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/lib/scheduling/utils.ts' is not a module.

11 export * from './utils';
                 ~~~~~~~~~

lib/scheduling/mock-data.ts:2:3 - error TS2305: Module '"./types"' has no exported member 'BuilderSchedulingProfile'.

2   BuilderSchedulingProfile,
    ~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/mock-data.ts:151:5 - error TS2820: Type '"confirmed"' is not assignable to type 'BookingStatus'. Did you mean 'BookingStatus.CONFIRMED'?

151     status: 'confirmed',
        ~~~~~~

  lib/scheduling/types.ts:91:3
    91   status: BookingStatus;
         ~~~~~~
    The expected type comes from property 'status' which is declared here on type 'Booking'

lib/scheduling/mock-data.ts:165:5 - error TS2820: Type '"pending"' is not assignable to type 'BookingStatus'. Did you mean 'BookingStatus.PENDING'?

165     status: 'pending',
        ~~~~~~

  lib/scheduling/types.ts:91:3
    91   status: BookingStatus;
         ~~~~~~
    The expected type comes from property 'status' which is declared here on type 'Booking'

lib/scheduling/real-data/scheduling-service-ext.ts:82:9 - error TS2353: Object literal may only specify known properties, and 'schedulingSettings' does not exist in type 'BuilderProfileInclude<DefaultArgs>'.

82         schedulingSettings: true
           ~~~~~~~~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:8805:5
    8805     include?: BuilderProfileInclude<ExtArgs> | null
             ~~~~~~~
    The expected type comes from property 'include' which is declared here on type '{ select?: BuilderProfileSelect<DefaultArgs> | null | undefined; omit?: BuilderProfileOmit<DefaultArgs> | null | undefined; include?: BuilderProfileInclude<...> | ... 1 more ... | undefined; where: BuilderProfileWhereUniqueInput; }'

lib/scheduling/state-machine/storage.ts:154:27 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(arg: PrismaPromise<any>[], options?: { isolationLevel?: TransactionIsolationLevel | undefined; } | undefined): Promise<any[]>', gave the following error.
    Argument of type '(prisma: PrismaClient) => Promise<void>' is not assignable to parameter of type 'PrismaPromise<any>[]'.
  Overload 2 of 2, '(fn: (prisma: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<...>, options?: { ...; } | undefined): Promise<...>', gave the following error.
    Argument of type '(prisma: PrismaClient) => Promise<void>' is not assignable to parameter of type '(prisma: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<...>'.
      Types of parameters 'prisma' and 'prisma' are incompatible.
        Type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">' is missing the following properties from type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>': $on, $connect, $disconnect, $use, and 2 more.

154     await db.$transaction(async (prisma: PrismaClient) => {
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


lib/scheduling/state-machine/storage.ts:164:11 - error TS2322: Type 'PaymentStatus | undefined' is not assignable to type 'PaymentStatus | EnumPaymentStatusFieldUpdateOperationsInput | undefined'.
  Type 'PaymentStatus.FAILED' is not assignable to type 'PaymentStatus | EnumPaymentStatusFieldUpdateOperationsInput | undefined'.

164           paymentStatus: stateData.paymentStatus,
              ~~~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:33133:5
    33133     paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
              ~~~~~~~~~~~~~
    The expected type comes from property 'paymentStatus' which is declared here on type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'

lib/scheduling/state-machine/storage.ts:182:20 - error TS2339: Property 'stateTransitionLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

182       await prisma.stateTransitionLog.create({
                       ~~~~~~~~~~~~~~~~~~

lib/scheduling/state-machine/storage.ts:221:37 - error TS2339: Property 'stateTransitionLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

221     const transitionLogs = await db.stateTransitionLog.findMany({
                                        ~~~~~~~~~~~~~~~~~~

lib/scheduling/state-machine/storage.ts:274:27 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(arg: PrismaPromise<any>[], options?: { isolationLevel?: TransactionIsolationLevel | undefined; } | undefined): Promise<any[]>', gave the following error.
    Argument of type '(prisma: PrismaClient) => Promise<void>' is not assignable to parameter of type 'PrismaPromise<any>[]'.
  Overload 2 of 2, '(fn: (prisma: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<...>, options?: { ...; } | undefined): Promise<...>', gave the following error.
    Argument of type '(prisma: PrismaClient) => Promise<void>' is not assignable to parameter of type '(prisma: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<...>'.
      Types of parameters 'prisma' and 'prisma' are incompatible.
        Type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">' is missing the following properties from type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>': $on, $connect, $disconnect, $use, and 2 more.

274     await db.$transaction(async (prisma: PrismaClient) => {
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


lib/scheduling/state-machine/storage.ts:276:20 - error TS2339: Property 'stateTransitionLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.

276       await prisma.stateTransitionLog.deleteMany({
                       ~~~~~~~~~~~~~~~~~~

lib/stripe/actions.ts:80:11 - error TS2741: Property 'success' is missing in type 'BuilderProfileResponse' but required in type '{ success: boolean; data?: BuilderProfileResponse | undefined; error?: string | undefined; }'.

80     const builderProfileResponse: { success: boolean; data?: BuilderProfileDataType; error?: string } = await getBuilderProfileById(builderId);
             ~~~~~~~~~~~~~~~~~~~~~~

  lib/stripe/actions.ts:80:37
    80     const builderProfileResponse: { success: boolean; data?: BuilderProfileDataType; error?: string } = await getBuilderProfileById(builderId);
                                           ~~~~~~~
    'success' is declared here.

lib/stripe/actions.ts:108:11 - error TS2353: Object literal may only specify known properties, and 'notes' does not exist in type 'Without<BookingCreateInput, BookingUncheckedCreateInput> & BookingUncheckedCreateInput'.

108           notes: notes,
              ~~~~~

  node_modules/.prisma/client/index.d.ts:19659:5
    19659     data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: BookingSelect<DefaultArgs> | null | undefined; omit?: BookingOmit<DefaultArgs> | null | undefined; include?: BookingInclude<...> | ... 1 more ... | undefined; data: (Without<...> & BookingUncheckedCreateInput) | (Without<...> & BookingCreateInput); }'

lib/stripe/actions.ts:146:7 - error TS2353: Object literal may only specify known properties, and 'metadata' does not exist in type 'BookingCheckoutParams'.

146       metadata: metadata, // StripeCheckoutMetadata is compatible here
          ~~~~~~~~

lib/stripe/actions.ts:254:15 - error TS2367: This comparison appears to be unintentional because the types 'PaymentStatus.UNPAID | PaymentStatus.FAILED' and 'PaymentStatus.PAID' have no overlap.

254           if (bookingData.paymentStatus !== SchedulingPaymentStatus.PAID) {
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 548 errors in 131 files.

Errors  Files
     1  app/(marketing)/metadata.ts:99
     3  app/(platform)/book/[builderId]/page.tsx:110
     5  app/(platform)/builder/[slug]/page.tsx:21
     2  app/(platform)/builder/profile/components/metrics-display.tsx:3
     6  app/(platform)/builder/profile/components/portfolio-gallery.tsx:7
     2  app/(platform)/builder/profile/components/validation-tier.tsx:3
     1  app/(platform)/marketplace/page.tsx:5
     2  app/(platform)/profile/[id]/page.tsx:88
     2  app/(platform)/profile/page.tsx:13
     1  app/(platform)/profile/profile-settings/availability/page.tsx:22
     3  app/(platform)/profile/profile-settings/page.tsx:46
     1  app/(platform)/trust/verification/[builderId]/page.tsx:51
     5  app/api/admin/builders/route.ts:3
     9  app/api/admin/session-types/[id]/route.ts:3
     8  app/api/profiles/builder/[id]/route.ts:48
     3  app/api/profiles/builder/clerk/[clerkId]/route.ts:65
     5  app/api/profiles/builder/route.ts:214
     8  app/api/profiles/builder/slug/[slug]/route.ts:40
     8  app/api/profiles/builders/route.ts:58
     4  app/api/scheduling/availability-exceptions/route.ts:106
     3  app/api/scheduling/availability-rules/route.ts:99
    14  app/api/scheduling/bookings/confirm/route.ts:5
     1  app/api/scheduling/bookings/create/route.ts:29
     1  app/api/scheduling/bookings/initialize/route.ts:25
     2  app/api/scheduling/builder-settings/route.ts:44
     2  app/api/scheduling/session-types/[id]/route.ts:30
     3  app/api/scheduling/session-types/route.ts:36
     1  app/api/stripe/sessions/[id]/route.ts:18
     2  app/api/stripe/webhook/route.ts:42
     1  app/api/test/auth/route.ts:17
     1  app/api/webhooks/calendly/route.ts:69
    11  app/api/webhooks/clerk/route.ts:90
     1  app/booking/schedule/page.tsx:7
     3  app/onboarding/page.tsx:43
     1  components/admin/admin-dashboard.tsx:111
     1  components/admin/settings-panel.tsx:4
     6  components/auth/optimized-loading-state.tsx:41
     3  components/booking/booking-button.tsx:83
     1  components/booking/index.ts:7
     1  components/community/ui/discussion-card.tsx:157
     1  components/community/ui/knowledge-item.tsx:168
     1  components/community/ui/server-discussion-card.tsx:130
    73  components/index.ts:7
     1  components/landing/ai-capabilities-marquee.tsx:6
     1  components/landing/brand-word-rotate.tsx:69
     3  components/landing/hero-section.tsx:6
    11  components/landing/index.ts:7
     1  components/landing/navbar.tsx:9
     1  components/landing/skills-tree-section.tsx:5
     1  components/landing/ui/index.ts:7
     1  components/learning/timeline.tsx:3
     2  components/learning/ui/timeline-filter.tsx:40
     3  components/learning/ui/timeline-item.tsx:7
     9  components/magicui/index.ts:7
     2  components/magicui/particles.tsx:103
     2  components/marketplace/components/builder-dashboard/builder-dashboard.tsx:292
    12  components/marketplace/hooks/use-builder-filter.ts:37
     1  components/payment/checkout-button.tsx:76
     1  components/payment/index.ts:13
     1  components/payment/payment-confirmation.tsx:43
     1  components/payment/payment-status-indicator.tsx:6
     1  components/payment/stripe-provider.tsx:47
     1  components/platform/platform-header.tsx:236
     2  components/profile/builder-profile-wrapper.tsx:71
    10  components/profile/builder-profile.tsx:42
     3  components/profile/client-profile.tsx:11
     3  components/profile/portfolio-gallery.tsx:77
     1  components/profile/profile-auth-provider.tsx:17
     1  components/profile/role-badges.tsx:53
     1  components/profile/success-metrics-dashboard.tsx:132
     1  components/providers/datadog-rum-provider.tsx:32
     1  components/providers/enhanced-clerk-provider.tsx:130
     3  components/providers/index.ts:7
     1  components/scheduling/builder/availability/availability-management.tsx:6
     1  components/scheduling/calendly/booking-confirmation.tsx:129
     1  components/scheduling/calendly/calendly-calendar.tsx:162
     3  components/scheduling/calendly/calendly-embed-optimized.tsx:34
     3  components/scheduling/calendly/calendly-embed.tsx:162
     2  components/scheduling/client/booking-calendar.tsx:341
     4  components/scheduling/client/booking-flow.tsx:270
     1  components/scheduling/client/integrated-booking.tsx:9
     2  components/scheduling/client/stripe-booking-form.tsx:84
     1  components/scheduling/index.ts:34
     2  components/scheduling/shared/timezone-selector.tsx:11
     1  components/ui/core/calendar.tsx:5
     3  components/user-auth-form.tsx:62
     7  hooks/index.ts:7
     6  instrumentation-client.ts:52
     1  instrumentation.ts:35
    21  lib/admin/api.ts:21
     1  lib/admin/index.ts:9
     7  lib/auth/api-protection.ts:53
     1  lib/auth/data-access.ts:53
    10  lib/auth/security-logging.ts:35
     4  lib/community/index.ts:11
     1  lib/contexts/profile-context.tsx:44
     6  lib/datadog/auth-monitoring.ts:126
     2  lib/datadog/client.ts:15
     1  lib/datadog/client/empty-tracer.client.ts:99
     5  lib/datadog/sentry-integration.ts:17
     1  lib/datadog/server-actions.ts:27
     4  lib/datadog/server/tracer.server.ts:71
     5  lib/datadog/tracer.ts:51
     2  lib/db-error-handling.ts:91
     9  lib/db-monitoring.ts:48
    14  lib/db.ts:40
     1  lib/enhanced-logger.client.ts:168
     1  lib/enhanced-logger.server.ts:202
     2  lib/marketplace/data/demo-account-handler.ts:39
     4  lib/marketplace/data/marketplace-service.ts:150
     3  lib/middleware/config.ts:212
     1  lib/middleware/factory.ts:172
     5  lib/middleware/profile-auth.ts:92
     1  lib/middleware/test-utils.ts:22
     8  lib/payment/actions.ts:5
     2  lib/payment/api.ts:302
    12  lib/profile/actions.ts:196
    19  lib/profile/api.ts:9
    10  lib/profile/data-service.ts:102
    12  lib/profile/index.ts:8
     1  lib/profile/schemas.ts:93
     1  lib/scheduling/actions.ts:281
     8  lib/scheduling/calendly/api-client.ts:71
     3  lib/scheduling/calendly/conflict-handler.ts:52
     7  lib/scheduling/calendly/refund-service.ts:72
     3  lib/scheduling/calendly/service.ts:295
     2  lib/scheduling/index.ts:8
     3  lib/scheduling/mock-data.ts:2
     1  lib/scheduling/real-data/scheduling-service-ext.ts:82
     6  lib/scheduling/state-machine/storage.ts:154
     4  lib/stripe/actions.ts:80
 ELIFECYCLE  Command failed with exit code 1.
