import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;

  @JsonKey(name: 'first_name')
  final String? firstName;

  @JsonKey(name: 'last_name')
  final String? lastName;

  final String username;
  final String? email;
  final String? role;
  final String? zone;
  final String? division;

  @JsonKey(name: 'is_active')
  final bool isActive;

  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  const UserModel({
    required this.id,
    this.firstName,
    this.lastName,
    required this.username,
    this.email,
    this.role,
    this.zone,
    this.division,
    this.isActive = true,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
}
