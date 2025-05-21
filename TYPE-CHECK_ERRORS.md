uildappswith@1.0.142 type-check /Users/liamj/Documents/development/buildappswith
> tsc --noEmit

app/(platform)/book/[builderId]/page.tsx:110:60 - error TS2339: Property 'avatarUrl' does not exist on type '{ sessionTypes: { price: number; builderId: string; calendlyEventTypeId: string | null; id: string; title: string; color: string | null; createdAt: Date; updatedAt: Date; description: string; ... 9 more ...; calendlyEventTypeUri: string | null; }[]; ... 28 more ...; schedulingSettings: JsonValue; }'.

110           {(builderProfile.user.imageUrl || builderProfile.avatarUrl) && (
                                                               ~~~~~~~~~

app/(platform)/book/[builderId]/page.tsx:113:69 - error TS2339: Property 'avatarUrl' does not exist on type '{ sessionTypes: { price: number; builderId: string; calendlyEventTypeId: string | null; id: string; title: string; color: string | null; createdAt: Date; updatedAt: Date; description: string; ... 9 more ...; calendlyEventTypeUri: string | null; }[]; ... 28 more ...; schedulingSettings: JsonValue; }'.

113                 src={builderProfile.user.imageUrl || builderProfile.avatarUrl || ''}
                                                                        ~~~~~~~~~

app/(platform)/book/[builderId]/page.tsx:139:13 - error TS2322: Type '{ price: number; builderId: string; calendlyEventTypeId: string | null; id: string; title: string; color: string | null; createdAt: Date; updatedAt: Date; description: string; ... 9 more ...; calendlyEventTypeUri: string | null; }[]' is not assignable to type 'SessionType[]'.
  Type '{ price: number; builderId: string; calendlyEventTypeId: string | null; id: string; title: string; color: string | null; createdAt: Date; updatedAt: Date; description: string; durationMinutes: number; ... 8 more ...; calendlyEventTypeUri: string | null; }' is not assignable to type 'SessionType'.
    Types of property 'color' are incompatible.
      Type 'string | null' is not assignable to type 'string | undefined'.
        Type 'null' is not assignable to type 'string | undefined'.

139             sessionTypes={builderProfile.sessionTypes}
                ~~~~~~~~~~~~

  components/scheduling/client/booking-flow.tsx:20:3
    20   sessionTypes?: SessionType[];
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

app/(platform)/builder/[slug]/page.tsx:68:25 - error TS2693: 'ValidationTier' only refers to a type, but is being used as a value here.

68         validationTier: ValidationTier.TIER3,
                           ~~~~~~~~~~~~~~

app/(platform)/builder/[slug]/page.tsx:281:13 - error TS2739: Type '{ id: string; name: string; title: string; bio: string; avatarUrl: string; coverImageUrl: string; validationTier: any; joinDate: Date; completedProjects: number; rating: number; responseRate: number; ... 7 more ...; expertiseAreas: { ...; }; }' is missing the following properties from type 'BuilderProfileData': userId, createdAt, updatedAt

281             profile={profile}
                ~~~~~~~

  components/profile/builder-profile-client-wrapper.tsx:24:3
    24   profile: BuilderProfileData;
         ~~~~~~~
    The expected type comes from property 'profile' which is declared here on type 'IntrinsicAttributes & BuilderProfileClientWrapperProps'

app/(platform)/profile/[id]/page.tsx:88:13 - error TS2322: Type '{ profileId: string; isPublicView: boolean; }' is not assignable to type 'IntrinsicAttributes & BuilderProfileWrapperProps'.
  Property 'profileId' does not exist on type 'IntrinsicAttributes & BuilderProfileWrapperProps'.

88             profileId={params.id}
               ~~~~~~~~~

app/(platform)/profile/[id]/page.tsx:93:13 - error TS2322: Type '{ userId: string; }' is not assignable to type 'IntrinsicAttributes & ClientDashboardProps'.
  Property 'userId' does not exist on type 'IntrinsicAttributes & ClientDashboardProps'.

93             userId={params.id}
               ~~~~~~

app/(platform)/profile/page.tsx:48:46 - error TS2554: Expected 0 arguments, but got 1.

48   const profile = await getPublicUserProfile(userId);
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

app/api/profiles/builder/[id]/route.ts:48:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

48             image: true,
               ~~~~~

app/api/profiles/builder/[id]/route.ts:68:44 - error TS2339: Property 'skills' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

68     const formattedSkills = builderProfile.skills.map(skill => ({
                                              ~~~~~~

app/api/profiles/builder/[id]/route.ts:68:55 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

68     const formattedSkills = builderProfile.skills.map(skill => ({
                                                         ~~~~~

app/api/profiles/builder/[id]/route.ts:78:28 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

78         id: builderProfile.user.id,
                              ~~~~

app/api/profiles/builder/[id]/route.ts:79:30 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

79         name: builderProfile.user.name,
                                ~~~~

app/api/profiles/builder/[id]/route.ts:80:31 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

80         email: builderProfile.user.email,
                                 ~~~~

app/api/profiles/builder/[id]/route.ts:81:31 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

81         image: builderProfile.user.image,
                                 ~~~~

app/api/profiles/builder/clerk/[clerkId]/route.ts:65:29 - error TS2339: Property 'category' does not exist on type '{ description: string | null; id: string; createdAt: Date; updatedAt: Date; slug: string; name: string; status: SkillStatus; domain: string; level: number; pathways: string[]; prerequisites: string[]; isFundamental: boolean; }'.

65       category: skill.skill.category,
                               ~~~~~~~~

app/api/profiles/builder/clerk/[clerkId]/route.ts:76:21 - error TS2339: Property 'image' does not exist on type '{ builderProfile: ({ skills: ({ skill: { description: string | null; id: string; createdAt: Date; updatedAt: Date; slug: string; name: string; status: SkillStatus; ... 4 more ...; isFundamental: boolean; }; } & { ...; })[]; } & { ...; }) | null; } & { ...; }'.

76         image: user.image,
                       ~~~~~

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

app/api/profiles/builder/route.ts:268:53 - error TS2339: Property 'skills' does not exist on type '{ userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; ... 19 more ...; schedulingSettings: JsonValue; }'.

268     const formattedSkills = updatedOrCreatedProfile.skills.map(skill => ({
                                                        ~~~~~~

app/api/profiles/builder/route.ts:268:64 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

268     const formattedSkills = updatedOrCreatedProfile.skills.map(skill => ({
                                                                   ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:40:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

40             image: true,
               ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:60:44 - error TS2339: Property 'skills' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

60     const formattedSkills = builderProfile.skills.map(skill => ({
                                              ~~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:60:55 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

60     const formattedSkills = builderProfile.skills.map(skill => ({
                                                         ~~~~~

app/api/profiles/builder/slug/[slug]/route.ts:71:28 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

71         id: builderProfile.user.id,
                              ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:72:30 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

72         name: builderProfile.user.name,
                                ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:73:31 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

73         email: builderProfile.user.email,
                                 ~~~~

app/api/profiles/builder/slug/[slug]/route.ts:74:31 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

74         image: builderProfile.user.image,
                                 ~~~~

app/api/profiles/builders/route.ts:58:13 - error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'UserSelect<DefaultArgs>'.

58             image: true,
               ~~~~~

app/api/profiles/builders/route.ts:82:21 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

82         id: profile.user.id,
                       ~~~~

app/api/profiles/builders/route.ts:83:23 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

83         name: profile.user.name,
                         ~~~~

app/api/profiles/builders/route.ts:84:24 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

84         email: profile.user.email,
                          ~~~~

app/api/profiles/builders/route.ts:85:24 - error TS2339: Property 'user' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

85         image: profile.user.image,
                          ~~~~

app/api/profiles/builders/route.ts:89:23 - error TS2339: Property 'skills' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

89       skills: profile.skills.map(skill => ({
                         ~~~~~~

app/api/profiles/builders/route.ts:89:34 - error TS7006: Parameter 'skill' implicitly has an 'any' type.

89       skills: profile.skills.map(skill => ({
                                    ~~~~~

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

  lib/scheduling/calendly/api-client.ts:71:14
    71 export class CalendlyApiClient {
                    ~~~~~~~~~~~~~~~~~
    'CalendlyApiClient' is declared here.

app/api/scheduling/bookings/confirm/route.ts:107:11 - error TS2353: Object literal may only specify known properties, and 'clientName' does not exist in type 'Without<BookingCreateInput, BookingUncheckedCreateInput> & BookingUncheckedCreateInput'.

107           clientName: clientDetails.name,
              ~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:19659:5
    19659     data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: BookingSelect<DefaultArgs> | null | undefined; omit?: BookingOmit<DefaultArgs> | null | undefined; include?: BookingInclude<...> | ... 1 more ... | undefined; data: (Without<...> & BookingUncheckedCreateInput) | (Without<...> & BookingCreateInput); }'

app/api/scheduling/bookings/confirm/route.ts:171:23 - error TS2339: Property 'scheduling_url' does not exist on type '{ uri: string; start_time: string; end_time: string; event_type: string | null; invitees_counter: { total: number; active: number; }; status: string; location: { type: string; location: string; }; }'.

171       calendlyBooking.scheduling_url = schedulingUrl;
                          ~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:183:17 - error TS2322: Type '"FAILED"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'.

183         data: { status: 'FAILED' }
                    ~~~~~~

  node_modules/.prisma/client/index.d.ts:33132:5
    33132     status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
              ~~~~~~
    The expected type comes from property 'status' which is declared here on type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'

app/api/scheduling/bookings/confirm/route.ts:196:9 - error TS2322: Type '"CONFIRMED" | "PENDING_PAYMENT"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'.
  Type '"PENDING_PAYMENT"' is not assignable to type 'BookingStatus | EnumBookingStatusFieldUpdateOperationsInput | undefined'.

196         status: Number(sessionType.price) > 0 ? 'PENDING_PAYMENT' : 'CONFIRMED',
            ~~~~~~

  node_modules/.prisma/client/index.d.ts:33132:5
    33132     status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
              ~~~~~~
    The expected type comes from property 'status' which is declared here on type '(Without<BookingUpdateInput, BookingUncheckedUpdateInput> & BookingUncheckedUpdateInput) | (Without<...> & BookingUpdateInput)'

app/api/scheduling/bookings/confirm/route.ts:208:44 - error TS2339: Property 'name' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

208           builderName: sessionType.builder.name,
                                               ~~~~

app/api/scheduling/bookings/confirm/route.ts:230:40 - error TS2339: Property 'scheduling_url' does not exist on type '{ uri: string; start_time: string; end_time: string; event_type: string | null; invitees_counter: { total: number; active: number; }; status: string; location: { type: string; location: string; }; }'.

230         schedulingUrl: calendlyBooking.scheduling_url,
                                           ~~~~~~~~~~~~~~

app/api/scheduling/bookings/confirm/route.ts:239:37 - error TS2339: Property 'name' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

239           name: sessionType.builder.name,
                                        ~~~~

app/api/scheduling/bookings/confirm/route.ts:240:38 - error TS2339: Property 'email' does not exist on type '{ id: string; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; domains: string[]; badges: string[]; rating: number | null; ... 18 more ...; schedulingSettings: JsonValue; }'.

240           email: sessionType.builder.email
                                         ~~~~~

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

components/auth/index.ts:16:10 - error TS2305: Module '"./clerk-auth-form"' has no exported member 'default'.

16 export { default as ClerkAuthForm } from './clerk-auth-form';
            ~~~~~~~

components/auth/index.ts:29:10 - error TS2305: Module '"./loading-state"' has no exported member 'default'.

29 export { default as LoadingState } from './loading-state';
            ~~~~~~~

components/auth/index.ts:30:10 - error TS2724: '"./optimized-loading-state"' has no exported member named 'OptimizedLoadingState'. Did you mean 'OptimizedAuthLoadingState'?

30 export { OptimizedLoadingState } from './optimized-loading-state';
            ~~~~~~~~~~~~~~~~~~~~~

  components/auth/optimized-loading-state.tsx:29:17
    29 export function OptimizedAuthLoadingState({
                       ~~~~~~~~~~~~~~~~~~~~~~~~~
    'OptimizedAuthLoadingState' is declared here.

components/auth/index.ts:34:15 - error TS2306: File '/Users/liamj/Documents/development/buildappswith/components/auth/ui/index.ts' is not a module.

34 export * from './ui';
                 ~~~~~~

components/auth/loading-state.tsx:5:8 - error TS2613: Module '"/Users/liamj/Documents/development/buildappswith/components/auth/progressive-loading-state"' has no default export. Did you mean to use 'import { ProgressiveLoadingState } from "/Users/liamj/Documents/development/buildappswith/components/auth/progressive-loading-state"' instead?

5 import ProgressiveLoadingState from "./progressive-loading-state";
         ~~~~~~~~~~~~~~~~~~~~~~~

components/landing/ui/index.ts:11:15 - error TS2724: '"./testimonial-scroll"' has no exported member named 'TestimonialScrollProps'. Did you mean 'TestimonialScroll'?

11 export type { TestimonialScrollProps, TestimonialCardProps } from './testimonial-scroll';
                 ~~~~~~~~~~~~~~~~~~~~~~

  components/landing/ui/testimonial-scroll.tsx:55:17
    55 export function TestimonialScroll({
                       ~~~~~~~~~~~~~~~~~
    'TestimonialScroll' is declared here.

components/magicui/index.ts:29:15 - error TS2724: '"./text-shimmer"' has no exported member named 'TextShimmerProps'. Did you mean 'TextShimmer'?

29 export type { TextShimmerProps } from './text-shimmer';
                 ~~~~~~~~~~~~~~~~

  components/magicui/text-shimmer.tsx:21:17
    21 export function TextShimmer({ children, className, shimmerWidth = 200 }: TextShimmerProps) {
                       ~~~~~~~~~~~
    'TextShimmer' is declared here.

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

components/marketplace/hooks/use-builder-filter.ts:184:11 - error TS2322: Type '(string | number)[] | undefined' is not assignable to type 'undefined'.
  Type '(string | number)[]' is not assignable to type 'undefined'.

184           newFilters[key] = newArray.length > 0 ? newArray : undefined;
              ~~~~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:187:11 - error TS2322: Type '(string | number)[]' is not assignable to type 'undefined'.

187           newFilters[key] = [...currentArray, value];
              ~~~~~~~~~~~~~~~

components/marketplace/hooks/use-builder-filter.ts:196:11 - error TS2322: Type 'string | number' is not assignable to type 'undefined'.
  Type 'string' is not assignable to type 'undefined'.

196           newFilters[key] = value;
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

components/profile/builder-profile-client-wrapper.tsx:87:9 - error TS2740: Type 'BuilderProfileData' is missing the following properties from type 'BuilderProfileData': title, joinDate, completedProjects, rating, and 2 more.

87         profile={profile}
           ~~~~~~~

  components/profile/builder-profile.tsx:88:3
    88   profile: BuilderProfileData;
         ~~~~~~~
    The expected type comes from property 'profile' which is declared here on type 'IntrinsicAttributes & BuilderProfileProps'

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

components/profile/builder-profile-wrapper.tsx:138:13 - error TS2322: Type '"primary"' is not assignable to type '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | undefined'.

138             variant="primary"
                ~~~~~~~

  components/booking/booking-button.tsx:23:3
    23   variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
         ~~~~~~~
    The expected type comes from property 'variant' which is declared here on type 'IntrinsicAttributes & BookingButtonProps'

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

components/providers/enhanced-clerk-provider.tsx:8:8 - error TS2613: Module '"/Users/liamj/Documents/development/buildappswith/components/auth/progressive-loading-state"' has no default export. Did you mean to use 'import { ProgressiveLoadingState } from "/Users/liamj/Documents/development/buildappswith/components/auth/progressive-loading-state"' instead?

8 import ProgressiveLoadingState from "@/components/auth/progressive-loading-state";
         ~~~~~~~~~~~~~~~~~~~~~~~

components/providers/enhanced-clerk-provider.tsx:130:7 - error TS2322: Type '{ children: Element; appearance: { baseTheme: BaseThemeTaggedType | undefined; elements: { formButtonPrimary: string; card: string; formButtonReset: string; ... 8 more ...; dividerText: string; }; }; publishableKey: string | undefined; signInUrl: string; signUpUrl: string; telemetry: boolean; }' is not assignable to type 'IntrinsicAttributes & NextAppClerkProviderProps'.
  Property 'telemetry' does not exist on type 'IntrinsicAttributes & NextAppClerkProviderProps'.

130       telemetry={false}
          ~~~~~~~~~

components/scheduling/builder/availability/availability-management.tsx:6:10 - error TS2305: Module '"@/lib/scheduling/types"' has no exported member 'BuilderSchedulingProfile'.

6 import { BuilderSchedulingProfile } from '@/lib/scheduling/types';
           ~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/booking-confirmation.tsx:129:33 - error TS2345: Argument of type 'Date' is not assignable to parameter of type 'string'.

129                     {formatDate(new Date(booking.startTime))}
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-calendar.tsx:161:24 - error TS7006: Parameter 'date' implicitly has an 'any' type.

161             disabled={(date) => {
                           ~~~~

components/scheduling/calendly/calendly-calendar.tsx:232:26 - error TS18048: 'slot.inviteesRemaining' is possibly 'undefined'.

232                         {slot.inviteesRemaining < 5 && (
                             ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-calendar.tsx:256:26 - error TS18048: 'slot.inviteesRemaining' is possibly 'undefined'.

256                         {slot.inviteesRemaining < 5 && (
                             ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-calendar.tsx:280:26 - error TS18048: 'slot.inviteesRemaining' is possibly 'undefined'.

280                         {slot.inviteesRemaining < 5 && (
                             ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-embed-optimized.tsx:35:5 - error TS2687: All declarations of 'Calendly' must have identical modifiers.

35     Calendly: any;
       ~~~~~~~~

components/scheduling/calendly/calendly-embed-optimized.tsx:35:5 - error TS2717: Subsequent property declarations must have the same type.  Property 'Calendly' must be of type 'CalendlyWindowType | undefined', but here has type 'any'.

35     Calendly: any;
       ~~~~~~~~

  components/scheduling/calendly/calendly-model.ts:119:5
    119     Calendly?: CalendlyWindowType;
            ~~~~~~~~
    'Calendly' was also declared here.

components/scheduling/calendly/calendly-embed-optimized.tsx:112:11 - error TS2353: Object literal may only specify known properties, and 'resize' does not exist in type '{ url: string; parentElement: HTMLElement; prefill?: Record<string, string> | undefined; utm?: Record<string, string> | undefined; hideEventTypeDetails?: boolean | undefined; ... 5 more ...; height?: string | undefined; }'.

112           resize: false
              ~~~~~~

components/scheduling/calendly/calendly-embed.tsx:201:32 - error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?

201         if (window.Calendly && window.Calendly.initInlineWidget) {
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/calendly-embed.tsx:260:5 - error TS2717: Subsequent property declarations must have the same type.  Property 'Calendly' must be of type 'CalendlyWindowType | undefined', but here has type '{ initInlineWidget: (options: { url: string; parentElement: HTMLElement; prefill?: Record<string, string> | undefined; utm?: Record<string, string> | undefined; }) => void; } | undefined'.

260     Calendly?: {
        ~~~~~~~~

  components/scheduling/calendly/calendly-model.ts:119:5
    119     Calendly?: CalendlyWindowType;
            ~~~~~~~~
    'Calendly' was also declared here.

components/scheduling/calendly/calendly-model.ts:119:5 - error TS2687: All declarations of 'Calendly' must have identical modifiers.

119     Calendly?: CalendlyWindowType;
        ~~~~~~~~

components/scheduling/calendly/index.ts:13:10 - error TS2305: Module '"./calendly-embed-optimized"' has no exported member 'default'.

13 export { default as CalendlyEmbedOptimized } from './calendly-embed-optimized';
            ~~~~~~~

components/scheduling/calendly/index.ts:22:3 - error TS2305: Module '"./calendly-model"' has no exported member 'CalendlyInvitee'.

22   CalendlyInvitee,
     ~~~~~~~~~~~~~~~

components/scheduling/calendly/index.ts:23:3 - error TS2305: Module '"./calendly-model"' has no exported member 'CalendlyWebhookEvent'.

23   CalendlyWebhookEvent,
     ~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/index.ts:24:3 - error TS2305: Module '"./calendly-model"' has no exported member 'CalendlyAvailableTimes'.

24   CalendlyAvailableTimes,
     ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/index.ts:25:3 - error TS2305: Module '"./calendly-model"' has no exported member 'CalendlySchedulingUrl'.

25   CalendlySchedulingUrl,
     ~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/index.ts:26:3 - error TS2724: '"./calendly-model"' has no exported member named 'CalendlyBookingDetails'. Did you mean 'CalendlyBooking'?

26   CalendlyBookingDetails,
     ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/calendly/index.ts:27:3 - error TS2305: Module '"./calendly-model"' has no exported member 'CalendlySessionType'.

27   CalendlySessionType
     ~~~~~~~~~~~~~~~~~~~

components/scheduling/client/booking-calendar.tsx:341:26 - error TS2304: Cannot find name 'Calendar'.

341                         <Calendar
                             ~~~~~~~~

components/scheduling/client/booking-calendar.tsx:345:38 - error TS7006: Parameter 'date' implicitly has an 'any' type.

345                           disabled={(date) => {
                                         ~~~~

components/scheduling/client/booking-flow.tsx:271:7 - error TS2554: Expected 2-4 arguments, but got 5.

271       customQuestionResponse
          ~~~~~~~~~~~~~~~~~~~~~~

components/scheduling/client/booking-flow.tsx:433:35 - error TS2339: Property 'userName' does not exist on type 'ClientBookingState'.

433                       name: state.userName || (isSignedIn ? 'User' : 'Guest'),
                                      ~~~~~~~~

components/scheduling/client/booking-flow.tsx:434:36 - error TS2339: Property 'userEmail' does not exist on type 'ClientBookingState'.

434                       email: state.userEmail || (isSignedIn ? 'user@example.com' : 'guest@example.com'),
                                       ~~~~~~~~~

components/scheduling/client/booking-flow.tsx:479:30 - error TS2353: Object literal may only specify known properties, and 'error' does not exist in type '{ message: string; code?: string | undefined; }'.

479                   payload: { error: error instanceof Error ? error : new Error('Unknown error') }
                                 ~~~~~

components/scheduling/client/stripe-booking-form.tsx:84:11 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<...> | (() => ReactNode)'.

84           title: 'Authentication Required',
             ~~~~~

components/scheduling/client/stripe-booking-form.tsx:99:9 - error TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<...> | (() => ReactNode)'.

99         title: 'Error',
           ~~~~~

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

lib/auth/index.ts:43:3 - error TS2300: Duplicate identifier 'AuthErrorType'.

43   AuthErrorType,
     ~~~~~~~~~~~~~

lib/auth/index.ts:84:16 - error TS2300: Duplicate identifier 'AuthErrorType'.

84   AuthError as AuthErrorType,
                  ~~~~~~~~~~~~~

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

lib/datadog/init.ts:85:42 - error TS2551: Property 'sessionReplaySampleRate' does not exist on type '{ enabled: boolean; applicationId: string; clientToken: string; site: string; service: string; env: DatadogEnvironment; version: string; sessionSampleRate: number; replaySampleRate: number; ... 4 more ...; actionNameAttribute: string; }'. Did you mean 'sessionSampleRate'?

85           replaySampleRate: mergedConfig.sessionReplaySampleRate,
                                            ~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/sentry-integration.ts:11:15 - error TS2724: '"@sentry/nextjs"' has no exported member named 'Integration'. Did you mean 'fsIntegration'?

11 import type { Integration, EventProcessor, Event } from '@sentry/nextjs';
                 ~~~~~~~~~~~

lib/datadog/sentry-integration.ts:11:28 - error TS2724: '"@sentry/nextjs"' has no exported member named 'EventProcessor'. Did you mean 'addEventProcessor'?

11 import type { Integration, EventProcessor, Event } from '@sentry/nextjs';
                              ~~~~~~~~~~~~~~

lib/datadog/server-actions.ts:27:14 - error TS2367: This comparison appears to be unintentional because the types '"development" | "test"' and '"staging"' have no overlap.

27              env === 'staging')
                ~~~~~~~~~~~~~~~~~

lib/datadog/server-tracer.ts:32:25 - error TS2339: Property 'scope' does not exist on type 'never'.

32     const span = tracer.scope().active();
                           ~~~~~

lib/datadog/server-tracer.ts:70:25 - error TS2339: Property 'startSpan' does not exist on type 'never'.

70     const span = tracer.startSpan('auth.verify', {
                           ~~~~~~~~~

lib/datadog/server/tracer.server.ts:61:11 - error TS2353: Object literal may only specify known properties, and 'analytics' does not exist in type 'TracerOptions'.

61           analytics: true,
             ~~~~~~~~~

lib/datadog/server/tracer.server.ts:86:14 - error TS2339: Property 'configureTracerIntegrations' does not exist on type 'TracerInterface'.

86         this.configureTracerIntegrations(ddTrace);
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/datadog/server/tracer.server.ts:137:3 - error TS2322: Type '(name: string, options?: any) => Span | null' is not assignable to type '(name: string, options?: any) => Span'.
  Type 'Span | null' is not assignable to type 'Span'.
    Type 'null' is not assignable to type 'Span'.

137   startSpan(name: string, options?: any): Span | null {
      ~~~~~~~~~

  lib/datadog/interfaces/tracer.ts:73:3
    73   startSpan(name: string, options?: any): Span;
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'startSpan' which is declared here on type 'TracerInterface'

lib/datadog/server/tracer.server.ts:221:9 - error TS2353: Object literal may only specify known properties, and 'router' does not exist in type 'next'.

221         router: true,
            ~~~~~~

lib/datadog/server/tracer.server.ts:233:43 - error TS2339: Property 'config' does not exist on type 'Tracer'.

233         service: `${tracerInstance.tracer.config.service}-db`
                                              ~~~~~~

lib/datadog/server/tracer.server.ts:238:9 - error TS2353: Object literal may only specify known properties, and 'app' does not exist in type 'express'.

238         app: undefined, // Auto-detected
            ~~~

lib/datadog/tracer.ts:36:7 - error TS2353: Object literal may only specify known properties, and 'analytics' does not exist in type 'TracerOptions'.

36       analytics: true,
         ~~~~~~~~~

lib/datadog/tracer.ts:78:7 - error TS2353: Object literal may only specify known properties, and 'router' does not exist in type 'next'.

78       router: true,
         ~~~~~~

lib/datadog/tracer.ts:95:7 - error TS2353: Object literal may only specify known properties, and 'app' does not exist in type 'express'.

95       app: undefined, // This will be automatically detected
         ~~~

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

lib/middleware/profile-auth.ts:153:39 - error TS2339: Property 'builderProfile' does not exist on type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

153           const builderProfile = user.builderProfile;
                                          ~~~~~~~~~~~~~~

lib/middleware/profile-auth.ts:181:38 - error TS2339: Property 'clientProfile' does not exist on type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

181           const clientProfile = user.clientProfile;
                                         ~~~~~~~~~~~~~

lib/middleware/profile-auth.ts:213:11 - error TS2322: Type '"client" | "unknown" | "builder"' is not assignable to type '"client" | "builder"'.
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

lib/profile/actions.ts:196:9 - error TS2322: Type 'JsonValue' is not assignable to type 'InputJsonValue | NullableJsonNullValueInput | undefined'.
  Type 'null' is not assignable to type 'InputJsonValue | NullableJsonNullValueInput | undefined'.

196         socialLinks: data.socialLinks !== undefined ? data.socialLinks : user.builderProfile.socialLinks,
            ~~~~~~~~~~~

  node_modules/.prisma/client/index.d.ts:32203:5
    32203     socialLinks?: NullableJsonNullValueInput | InputJsonValue
              ~~~~~~~~~~~
    The expected type comes from property 'socialLinks' which is declared here on type '(Without<BuilderProfileUpdateInput, BuilderProfileUncheckedUpdateInput> & BuilderProfileUncheckedUpdateInput) | (Without<...> & BuilderProfileUpdateInput)'

lib/profile/actions.ts:197:9 - error TS2322: Type 'any[] | null' is not assignable to type 'BuilderProfileUpdateportfolioItemsInput | InputJsonValue[] | undefined'.
  Type 'null' is not assignable to type 'BuilderProfileUpdateportfolioItemsInput | InputJsonValue[] | undefined'.

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

lib/profile/actions.ts:600:19 - error TS2339: Property 'title' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

600       title: user.title,
                      ~~~~~

lib/profile/actions.ts:601:17 - error TS2339: Property 'bio' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

601       bio: user.bio,
                    ~~~

lib/profile/actions.ts:602:22 - error TS2339: Property 'location' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

602       location: user.location,
                         ~~~~~~~~

lib/profile/actions.ts:603:21 - error TS2339: Property 'website' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

603       website: user.website,
                        ~~~~~~~

lib/profile/actions.ts:664:19 - error TS2339: Property 'title' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

664       title: user.title,
                      ~~~~~

lib/profile/actions.ts:665:17 - error TS2339: Property 'bio' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

665       bio: user.bio,
                    ~~~

lib/profile/actions.ts:666:22 - error TS2339: Property 'location' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

666       location: user.location,
                         ~~~~~~~~

lib/profile/actions.ts:667:21 - error TS2339: Property 'website' does not exist on type '{ builderProfile: { userId: string; id: string; displayName: string | null; bio: string | null; headline: string | null; hourlyRate: Decimal | null; featuredBuilder: boolean; ... 20 more ...; schedulingSettings: JsonValue; } | null; } & { ...; }'.

667       website: user.website,
                        ~~~~~~~

lib/profile/actions.ts:745:28 - error TS2339: Property 'interests' does not exist on type '{ verified: boolean; name: string | null; id: string; createdAt: Date; updatedAt: Date; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; clerkId: string | null; isDemo: boolean; }'.

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

lib/profile/data-service.ts:102:5 - error TS2322: Type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }' is not assignable to type '{ builderProfile: { id: string; availability: string; createdAt: Date; updatedAt: Date; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; clientProfile: { ...; } | null; } & { ...; }'.
  Type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }' is missing the following properties from type '{ builderProfile: { id: string; availability: string; createdAt: Date; updatedAt: Date; userId: string; bio: string | null; headline: string | null; hourlyRate: Decimal | null; ... 19 more ...; schedulingSettings: JsonValue; } | null; clientProfile: { ...; } | null; }': builderProfile, clientProfile

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

lib/profile/data-service.ts:353:43 - error TS2339: Property 'image' does not exist on type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

353         image: userData.image_url || user.image,
                                              ~~~~~

lib/profile/data-service.ts:371:43 - error TS2339: Property 'image' does not exist on type '{ id: string; name: string | null; email: string; emailVerified: Date | null; imageUrl: string | null; roles: UserRole[]; isFounder: boolean; stripeCustomerId: string | null; ... 4 more ...; updatedAt: Date; }'.

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

lib/profile/schemas.ts:101:32 - error TS2693: 'ValidationTier' only refers to a type, but is being used as a value here.

101   validationTier: z.nativeEnum(ValidationTier),
                                   ~~~~~~~~~~~~~~

lib/scheduling/calendly/service.ts:296:25 - error TS2352: Conversion of type 'string | number | boolean | JsonObject | JsonArray | null' to type 'SchedulingSettings' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'JsonValue[]' is missing the following properties from type 'SchedulingSettings': id, builderId

296       builderTimezone: (sessionType.builder?.schedulingSettings as SchedulingSettings)?.timezone || undefined
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/scheduling/calendly/webhook-security.ts:256:36 - error TS2339: Property 'name' does not exist on type '{}'.

256     eventType: payload.event_type?.name,
                                       ~~~~

lib/scheduling/calendly/webhook-security.ts:257:36 - error TS2339: Property 'email' does not exist on type '{}'.

257     inviteeEmail: payload.invitee?.email,
                                       ~~~~~

lib/scheduling/calendly/webhook-security.ts:258:29 - error TS2339: Property 'uuid' does not exist on type '{}'.

258     eventId: payload.event?.uuid,
                                ~~~~

lib/scheduling/calendly/webhook-security.ts:259:33 - error TS2339: Property 'uuid' does not exist on type '{}'.

259     inviteeId: payload.invitee?.uuid,
                                    ~~~~

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

lib/stripe/actions.ts:140:11 - error TS2739: Type '{ builderId: string; builderName: string; sessionType: string; sessionPrice: number; userEmail: string; bookingId: string; metadata: StripeCheckoutMetadata; userId: string; successUrl: string; cancelUrl: string; paymentOption: "full" | ... 2 more ... | undefined; clientName: string; }' is missing the following properties from type 'BookingCheckoutParams': startTime, endTime, timeZone

140     const bookingCheckoutParams: BookingCheckoutParams = {
              ~~~~~~~~~~~~~~~~~~~~~


Found 362 errors in 104 files.

Errors  Files
     3  app/(platform)/book/[builderId]/page.tsx:110
     6  app/(platform)/builder/[slug]/page.tsx:21
     2  app/(platform)/profile/[id]/page.tsx:88
     1  app/(platform)/profile/page.tsx:48
     1  app/(platform)/profile/profile-settings/availability/page.tsx:22
     3  app/(platform)/profile/profile-settings/page.tsx:46
     1  app/(platform)/trust/verification/[builderId]/page.tsx:51
     7  app/api/profiles/builder/[id]/route.ts:48
     2  app/api/profiles/builder/clerk/[clerkId]/route.ts:65
     5  app/api/profiles/builder/route.ts:214
     7  app/api/profiles/builder/slug/[slug]/route.ts:40
     7  app/api/profiles/builders/route.ts:58
     3  app/api/scheduling/availability-rules/route.ts:99
    10  app/api/scheduling/bookings/confirm/route.ts:5
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
     4  components/auth/index.ts:16
     1  components/auth/loading-state.tsx:5
     1  components/landing/ui/index.ts:11
     1  components/magicui/index.ts:29
     2  components/marketplace/components/builder-dashboard/builder-dashboard.tsx:292
     3  components/marketplace/hooks/use-builder-filter.ts:184
     1  components/payment/checkout-button.tsx:76
     1  components/payment/index.ts:13
     1  components/payment/payment-confirmation.tsx:43
     1  components/payment/payment-status-indicator.tsx:6
     1  components/payment/stripe-provider.tsx:47
     1  components/platform/platform-header.tsx:236
     1  components/profile/builder-profile-client-wrapper.tsx:87
     3  components/profile/builder-profile-wrapper.tsx:71
    10  components/profile/builder-profile.tsx:42
     3  components/profile/client-profile.tsx:11
     3  components/profile/portfolio-gallery.tsx:77
     1  components/profile/profile-auth-provider.tsx:17
     1  components/profile/role-badges.tsx:53
     1  components/profile/success-metrics-dashboard.tsx:132
     1  components/providers/datadog-rum-provider.tsx:32
     2  components/providers/enhanced-clerk-provider.tsx:8
     1  components/scheduling/builder/availability/availability-management.tsx:6
     1  components/scheduling/calendly/booking-confirmation.tsx:129
     4  components/scheduling/calendly/calendly-calendar.tsx:161
     3  components/scheduling/calendly/calendly-embed-optimized.tsx:35
     2  components/scheduling/calendly/calendly-embed.tsx:201
     1  components/scheduling/calendly/calendly-model.ts:119
     7  components/scheduling/calendly/index.ts:13
     2  components/scheduling/client/booking-calendar.tsx:341
     4  components/scheduling/client/booking-flow.tsx:271
     2  components/scheduling/client/stripe-booking-form.tsx:84
     2  components/scheduling/shared/timezone-selector.tsx:11
     1  components/ui/core/calendar.tsx:5
     3  components/user-auth-form.tsx:62
     7  hooks/index.ts:7
     1  instrumentation.ts:35
    21  lib/admin/api.ts:21
     1  lib/admin/index.ts:9
     7  lib/auth/api-protection.ts:53
     1  lib/auth/data-access.ts:53
     2  lib/auth/index.ts:43
    10  lib/auth/security-logging.ts:35
     4  lib/community/index.ts:11
     1  lib/contexts/profile-context.tsx:44
     1  lib/datadog/init.ts:85
     2  lib/datadog/sentry-integration.ts:11
     1  lib/datadog/server-actions.ts:27
     2  lib/datadog/server-tracer.ts:32
     6  lib/datadog/server/tracer.server.ts:61
     3  lib/datadog/tracer.ts:36
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
     2  lib/profile/schemas.ts:93
     1  lib/scheduling/calendly/service.ts:296
     4  lib/scheduling/calendly/webhook-security.ts:256
     2  lib/scheduling/index.ts:8
     3  lib/scheduling/mock-data.ts:2
     1  lib/scheduling/real-data/scheduling-service-ext.ts:82
     6  lib/scheduling/state-machine/storage.ts:154
     1  lib/stripe/actions.ts:140
 ELIFECYCLE  Command failed with exit code 1.
