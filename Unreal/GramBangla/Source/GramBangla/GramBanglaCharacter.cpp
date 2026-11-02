#include "GramBanglaCharacter.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/Controller.h"
#include "GameFramework/SpringArmComponent.h"
#include "UObject/ConstructorHelpers.h"

AGramBanglaCharacter::AGramBanglaCharacter()
{
    PrimaryActorTick.bCanEverTick = false;
    GetCapsuleComponent()->InitCapsuleSize(42.f, 94.f);
    bUseControllerRotationYaw = false;
    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.f, 450.f, 0.f);
    GetCharacterMovement()->MaxWalkSpeed = 375.f;
    GetCharacterMovement()->JumpZVelocity = 450.f;
    GetCharacterMovement()->AirControl = 0.26f;
    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 440.f;
    CameraBoom->bUsePawnControlRotation = true;
    CameraBoom->SocketOffset = FVector(0.f,0.f,115.f);
    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->bUsePawnControlRotation = false;
    PlaceholderBody = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PlaceholderBody"));
    PlaceholderBody->SetupAttachment(GetCapsuleComponent());
    PlaceholderBody->SetRelativeLocation(FVector(0.f,0.f,-3.f));
    PlaceholderBody->SetRelativeScale3D(FVector(.45f,.28f,1.35f));
    PlaceholderBody->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (Cube.Succeeded()) PlaceholderBody->SetStaticMesh(Cube.Object);
    GetMesh()->SetVisibility(false);
}
void AGramBanglaCharacter::SetupPlayerInputComponent(UInputComponent* Input)
{
    Super::SetupPlayerInputComponent(Input);
    check(Input);
    Input->BindAxis("MoveForward", this, &AGramBanglaCharacter::MoveForward);
    Input->BindAxis("MoveRight", this, &AGramBanglaCharacter::MoveRight);
    Input->BindAxis("Turn", this, &APawn::AddControllerYawInput);
    Input->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);
    Input->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    Input->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    Input->BindAction("Sprint", IE_Pressed, this, &AGramBanglaCharacter::StartSprint);
    Input->BindAction("Sprint", IE_Released, this, &AGramBanglaCharacter::StopSprint);
}
void AGramBanglaCharacter::MoveForward(float Value)
{
    if (Controller && FMath::Abs(Value)>KINDA_SMALL_NUMBER) {
        const FRotator Yaw(0.f,Controller->GetControlRotation().Yaw,0.f);
        AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::X),Value);
    }
}
void AGramBanglaCharacter::MoveRight(float Value)
{
    if (Controller && FMath::Abs(Value)>KINDA_SMALL_NUMBER) {
        const FRotator Yaw(0.f,Controller->GetControlRotation().Yaw,0.f);
        AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y),Value);
    }
}
void AGramBanglaCharacter::StartSprint() { GetCharacterMovement()->MaxWalkSpeed=625.f; }
void AGramBanglaCharacter::StopSprint() { GetCharacterMovement()->MaxWalkSpeed=375.f; }
